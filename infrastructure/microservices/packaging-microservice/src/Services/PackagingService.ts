import { Repository, Like } from "typeorm";
import { IPackagingService } from "../Domain/services/IPackagingService";
import { Packaging } from "../Domain/models/Packaging";
import { CreatePackagingDTO } from "../Domain/DTOs/CreatePackagingDTO";
import { UpdatePackagingDTO } from "../Domain/DTOs/UpdatePackagingDTO";
import { AuditLogClient } from "./AuditLogClient";
import { LogType } from "./LogType";
import { PackagingStatus } from "../Domain/enums/PackagingStatus";

export class PackagingService implements IPackagingService {
  constructor(private readonly repo: Repository<Packaging>, private readonly audit: AuditLogClient) {}

  async create(data: CreatePackagingDTO): Promise<Packaging> {
    this.validateStatus(data.status);

    const entity = this.repo.create({
      name: data.name.trim(),
      senderAddress: data.senderAddress.trim(),
      warehouseId: data.warehouseId,
      perfumeIds: data.perfumeIds,
      status: data.status ?? PackagingStatus.SPAKOVANA,
    });
    const saved = await this.repo.save(entity);
    await this.audit.log(LogType.INFO, `Kreirana ambalaza ${saved.name} (ID ${saved.id})`);
    return saved;
  }

  async update(id: number, data: UpdatePackagingDTO): Promise<Packaging> {
    const packaging = await this.repo.findOne({ where: { id } });
    if (!packaging) {
      await this.audit.log(LogType.WARNING, `Ambalaza ${id} nije pronadjena`);
      throw new Error("Packaging not found");
    }

    if (data.status !== undefined) this.validateStatus(data.status);
    if (data.name !== undefined) packaging.name = data.name.trim();
    if (data.senderAddress !== undefined) packaging.senderAddress = data.senderAddress.trim();
    if (data.warehouseId !== undefined) packaging.warehouseId = data.warehouseId;
    if (data.perfumeIds !== undefined) packaging.perfumeIds = data.perfumeIds;
    if (data.status !== undefined) packaging.status = data.status;

    const saved = await this.repo.save(packaging);
    await this.audit.log(LogType.INFO, `Azurirana ambalaza ID ${saved.id}`);
    return saved;
  }

  async delete(id: number): Promise<void> {
    const result = await this.repo.delete({ id });
    if (!result.affected) {
      await this.audit.log(LogType.WARNING, `Ambalaza ${id} nije pronadjena za brisanje`);
      throw new Error("Packaging not found");
    }
    await this.audit.log(LogType.INFO, `Obrisana ambalaza ID ${id}`);
  }

  async getById(id: number): Promise<Packaging> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) {
      await this.audit.log(LogType.WARNING, `Ambalaza ${id} nije pronadjena`);
      throw new Error("Packaging not found");
    }
    await this.audit.log(LogType.INFO, `Dohvacena ambalaza ID ${id}`);
    return item;
  }

  async getAll(): Promise<Packaging[]> {
    const items = await this.repo.find({ order: { createdAt: "DESC" } });
    await this.audit.log(LogType.INFO, `Dohvacene sve ambalaze (${items.length})`);
    return items;
  }

  async search(query: string): Promise<Packaging[]> {
    const q = query?.trim();
    if (!q || q.length < 2) {
      await this.audit.log(LogType.WARNING, "Nevalidan query za pretragu ambalaza");
      throw new Error("Query must be at least 2 characters long");
    }
    const items = await this.repo.find({
      where: [{ name: Like(`%${q}%`) }, { senderAddress: Like(`%${q}%`) }],
      order: { createdAt: "DESC" },
    });
    await this.audit.log(LogType.INFO, `Pretraga ambalaza '${q}' -> ${items.length} rezultata`);
    return items;
  }

  private validateStatus(status?: PackagingStatus) {
    if (status && !Object.values(PackagingStatus).includes(status)) {
      throw new Error("Nepoznat status ambalaze");
    }
  }
}
