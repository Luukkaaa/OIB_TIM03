import { Repository, Like } from "typeorm";
import { IWarehouseService } from "../Domain/services/IWarehouseService";
import { Warehouse } from "../Domain/models/Warehouse";
import { CreateWarehouseDTO } from "../Domain/DTOs/CreateWarehouseDTO";
import { UpdateWarehouseDTO } from "../Domain/DTOs/UpdateWarehouseDTO";
import { AuditLogClient } from "./AuditLogClient";
import { LogType } from "./LogType";

export class WarehouseService implements IWarehouseService {
  constructor(private readonly repo: Repository<Warehouse>, private readonly audit: AuditLogClient) {}

  async create(data: CreateWarehouseDTO): Promise<Warehouse> {
    await this.ensureUniqueName(data.name);
    const entity = this.repo.create({
      name: data.name.trim(),
      location: data.location.trim(),
      capacity: data.capacity,
      packagingIds: data.packagingIds ?? [],
    });
    const saved = await this.repo.save(entity);
    await this.audit.log(LogType.INFO, `Kreirano skladiste ${saved.name} (ID ${saved.id})`);
    return saved;
  }

  async update(id: number, data: UpdateWarehouseDTO): Promise<Warehouse> {
    const wh = await this.repo.findOne({ where: { id } });
    if (!wh) {
      await this.audit.log(LogType.WARNING, `Skladiste ${id} nije pronadjeno`);
      throw new Error("Warehouse not found");
    }

    if (data.name && data.name.trim() !== wh.name) {
      await this.ensureUniqueName(data.name);
      wh.name = data.name.trim();
    }
    if (data.location !== undefined) wh.location = data.location.trim();
    if (data.capacity !== undefined) wh.capacity = data.capacity;
    if (data.packagingIds !== undefined) wh.packagingIds = data.packagingIds;

    const saved = await this.repo.save(wh);
    await this.audit.log(LogType.INFO, `Azurirano skladiste ID ${saved.id}`);
    return saved;
  }

  async delete(id: number): Promise<void> {
    const result = await this.repo.delete({ id });
    if (!result.affected) {
      await this.audit.log(LogType.WARNING, `Skladiste ${id} nije pronadjeno za brisanje`);
      throw new Error("Warehouse not found");
    }
    await this.audit.log(LogType.INFO, `Obrisano skladiste ID ${id}`);
  }

  async getById(id: number): Promise<Warehouse> {
    const wh = await this.repo.findOne({ where: { id } });
    if (!wh) {
      await this.audit.log(LogType.WARNING, `Skladiste ${id} nije pronadjeno`);
      throw new Error("Warehouse not found");
    }
    await this.audit.log(LogType.INFO, `Dohvaceno skladiste ID ${id}`);
    return wh;
  }

  async getAll(): Promise<Warehouse[]> {
    const items = await this.repo.find({ order: { createdAt: "DESC" } });
    await this.audit.log(LogType.INFO, `Dohvacena sva skladista (${items.length})`);
    return items;
  }

  async search(query: string): Promise<Warehouse[]> {
    const q = query?.trim();
    if (!q || q.length < 2) {
      await this.audit.log(LogType.WARNING, "Nevalidan query za pretragu skladista");
      throw new Error("Query must be at least 2 characters long");
    }
    const items = await this.repo.find({
      where: [{ name: Like(`%${q}%`) }, { location: Like(`%${q}%`) }],
      order: { createdAt: "DESC" },
    });
    await this.audit.log(LogType.INFO, `Pretraga skladista '${q}' -> ${items.length} rezultata`);
    return items;
  }

  private async ensureUniqueName(name: string, excludeId?: number) {
    const existing = await this.repo.findOne({ where: { name: name.trim() } });
    if (existing && existing.id !== excludeId) {
      throw new Error("Skladiste sa datim nazivom vec postoji");
    }
  }
}
