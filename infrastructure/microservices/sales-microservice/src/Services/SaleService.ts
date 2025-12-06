import { Repository, Like } from "typeorm";
import { ISaleService } from "../Domain/services/ISaleService";
import { Sale } from "../Domain/models/Sale";
import { CreateSaleDTO } from "../Domain/DTOs/CreateSaleDTO";
import { UpdateSaleDTO } from "../Domain/DTOs/UpdateSaleDTO";
import { AuditLogClient } from "./AuditLogClient";
import { LogType } from "./LogType";
import { SaleType } from "../Domain/enums/SaleType";
import { PaymentMethod } from "../Domain/enums/PaymentMethod";

export class SaleService implements ISaleService {
  constructor(private readonly repo: Repository<Sale>, private readonly audit: AuditLogClient) {}

  async create(data: CreateSaleDTO): Promise<Sale> {
    this.validateEnums(data.saleType, data.paymentMethod);
    const totalAmount = this.calculateTotal(data);
    const entity = this.repo.create({
      saleType: data.saleType,
      paymentMethod: data.paymentMethod,
      items: data.items,
      totalAmount,
      receiptNumber: data.receiptNumber.trim(),
    });
    const saved = await this.repo.save(entity);
    await this.audit.log(LogType.INFO, `Kreirana prodaja ${saved.receiptNumber} (${saved.id})`);
    return saved;
  }

  async update(id: number, data: UpdateSaleDTO): Promise<Sale> {
    const sale = await this.repo.findOne({ where: { id } });
    if (!sale) {
      await this.audit.log(LogType.WARNING, `Prodaja ${id} nije pronadjena`);
      throw new Error("Sale not found");
    }

    if (data.saleType !== undefined) {
      this.validateSaleType(data.saleType);
      sale.saleType = data.saleType;
    }
    if (data.paymentMethod !== undefined) {
      this.validatePayment(data.paymentMethod);
      sale.paymentMethod = data.paymentMethod;
    }
    if (data.items !== undefined) {
      sale.items = data.items;
      sale.totalAmount = this.calculateTotal({ ...sale, items: data.items } as any);
    }
    if (data.receiptNumber !== undefined) {
      sale.receiptNumber = data.receiptNumber.trim();
    }

    const saved = await this.repo.save(sale);
    await this.audit.log(LogType.INFO, `Azurirana prodaja ${saved.receiptNumber} (${saved.id})`);
    return saved;
  }

  async delete(id: number): Promise<void> {
    const result = await this.repo.delete({ id });
    if (!result.affected) {
      await this.audit.log(LogType.WARNING, `Prodaja ${id} nije pronadjena za brisanje`);
      throw new Error("Sale not found");
    }
    await this.audit.log(LogType.INFO, `Obrisana prodaja ID ${id}`);
  }

  async getById(id: number): Promise<Sale> {
    const sale = await this.repo.findOne({ where: { id } });
    if (!sale) {
      await this.audit.log(LogType.WARNING, `Prodaja ${id} nije pronadjena`);
      throw new Error("Sale not found");
    }
    await this.audit.log(LogType.INFO, `Dohvacena prodaja ${id}`);
    return sale;
  }

  async getAll(): Promise<Sale[]> {
    const items = await this.repo.find({ order: { createdAt: "DESC" } });
    await this.audit.log(LogType.INFO, `Dohvacene sve prodaje (${items.length})`);
    return items;
  }

  async search(query: string): Promise<Sale[]> {
    const q = query?.trim();
    if (!q || q.length < 2) {
      await this.audit.log(LogType.WARNING, "Nevalidan query za pretragu prodaja");
      throw new Error("Query must be at least 2 characters long");
    }
    const items = await this.repo.find({
      where: [{ receiptNumber: Like(`%${q}%`) }],
      order: { createdAt: "DESC" },
    });
    await this.audit.log(LogType.INFO, `Pretraga prodaja '${q}' -> ${items.length} rezultata`);
    return items;
  }

  private calculateTotal(data: { items: { quantity: number; unitPrice: number }[] }): number {
    return data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  }

  private validateEnums(saleType: SaleType, payment: PaymentMethod) {
    this.validateSaleType(saleType);
    this.validatePayment(payment);
  }

  private validateSaleType(val: SaleType) {
    if (!Object.values(SaleType).includes(val)) {
      throw new Error("Nepoznat tip prodaje");
    }
  }

  private validatePayment(val: PaymentMethod) {
    if (!Object.values(PaymentMethod).includes(val)) {
      throw new Error("Nepoznat nacin placanja");
    }
  }
}
