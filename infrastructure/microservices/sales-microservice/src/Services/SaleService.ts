import { Repository, Like } from "typeorm";
import { ISaleService } from "../Domain/services/ISaleService";
import { Sale } from "../Domain/models/Sale";
import { CreateSaleDTO } from "../Domain/DTOs/CreateSaleDTO";
import { UpdateSaleDTO } from "../Domain/DTOs/UpdateSaleDTO";
import { AuditLogClient } from "./AuditLogClient";
import { LogType } from "./LogType";
import { SaleType } from "../Domain/enums/SaleType";
import { PaymentMethod } from "../Domain/enums/PaymentMethod";
import { SalesReportFilter, SalesSummaryDTO } from "../Domain/DTOs/SalesSummaryDTO";

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

  async getSummary(filter: SalesReportFilter): Promise<SalesSummaryDTO> {
    const qb = this.repo.createQueryBuilder("sale");
    if (filter.from) qb.andWhere("sale.createdAt >= :from", { from: filter.from });
    if (filter.to) qb.andWhere("sale.createdAt <= :to", { to: filter.to });
    if (filter.paymentMethod) qb.andWhere("sale.paymentMethod = :pm", { pm: filter.paymentMethod });
    if (filter.saleType) qb.andWhere("sale.saleType = :st", { st: filter.saleType });

    const sales = await qb.orderBy("sale.createdAt", "DESC").getMany();
    const totalCount = sales.length;
    const totalAmount = sales.reduce((sum, s) => sum + Number(s.totalAmount), 0);
    const averageAmount = totalCount ? totalAmount / totalCount : 0;

    const byPaymentMethod = Object.values(PaymentMethod).map((pm) => {
      const arr = sales.filter((s) => s.paymentMethod === pm);
      const count = arr.length;
      const amount = arr.reduce((sum, s) => sum + Number(s.totalAmount), 0);
      return { paymentMethod: pm, totalAmount: amount, count, averageAmount: count ? amount / count : 0 };
    });

    const bySaleType = Object.values(SaleType).map((st) => {
      const arr = sales.filter((s) => s.saleType === st);
      const count = arr.length;
      const amount = arr.reduce((sum, s) => sum + Number(s.totalAmount), 0);
      return { saleType: st, totalAmount: amount, count, averageAmount: count ? amount / count : 0 };
    });

    await this.audit.log(
      LogType.INFO,
      `Generisan rezime prodaja (${totalCount} računa)${filter.from ? ` od ${filter.from.toISOString()}` : ""}${
        filter.to ? ` do ${filter.to.toISOString()}` : ""
      }`
    );

    return {
      from: filter.from?.toISOString(),
      to: filter.to?.toISOString(),
      totalCount,
      totalAmount,
      averageAmount,
      byPaymentMethod,
      bySaleType,
    };
  }

  async exportSummaryCSV(filter: SalesReportFilter): Promise<{ filename: string; contentType: string; content: string }> {
    const summary = await this.getSummary(filter);
    const fromPart = summary.from ? summary.from.slice(0, 10) : "all";
    const toPart = summary.to ? summary.to.slice(0, 10) : "now";
    const filename = `sales-summary-${fromPart}-to-${toPart}.csv`;

    const lines: string[] = [];
    lines.push("metric,value");
    lines.push(`totalCount,${summary.totalCount}`);
    lines.push(`totalAmount,${summary.totalAmount.toFixed(2)}`);
    lines.push(`averageAmount,${summary.averageAmount.toFixed(2)}`);
    lines.push("");
    lines.push("byPaymentMethod,amount,count,avg");
    summary.byPaymentMethod.forEach((p) =>
      lines.push(`${p.paymentMethod},${p.totalAmount.toFixed(2)},${p.count},${p.averageAmount.toFixed(2)}`)
    );
    lines.push("");
    lines.push("bySaleType,amount,count,avg");
    summary.bySaleType.forEach((p) =>
      lines.push(`${p.saleType},${p.totalAmount.toFixed(2)},${p.count},${p.averageAmount.toFixed(2)}`)
    );

    return { filename, contentType: "text/csv", content: lines.join("\n") };
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
