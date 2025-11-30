import { Repository, Like } from "typeorm";
import { AuditLog } from "../domain/models/AuditLog";
import { IAuditService } from "../domain/services/IAuditService";
import { CreateAuditLogDTO } from "../domain/DTOs/CreateAuditLogDTO";
import { UpdateAuditLogDTO } from "../domain/DTOs/UpdateAuditLogDTO";
import { LogType } from "../domain/enums/LogType";

export class AuditService implements IAuditService {
  constructor(private readonly repo: Repository<AuditLog>) {}

  async create(data: CreateAuditLogDTO): Promise<AuditLog> {
    this.validateType(data.type);
    this.validateDescription(data.description);

    const entity = this.repo.create({
      type: data.type,
      description: data.description.trim(),
      createdAt: data.createdAt ?? new Date(),
    });
    return this.repo.save(entity);
  }

  async update(id: number, data: UpdateAuditLogDTO): Promise<AuditLog> {
    const existing = await this.repo.findOneBy({ id });
    if (!existing) {
      throw new Error("Log not found");
    }

    if (data.type) {
      this.validateType(data.type);
      existing.type = data.type;
    }
    if (data.description !== undefined) {
      this.validateDescription(data.description);
      existing.description = data.description.trim();
    }
    if (data.createdAt) {
      existing.createdAt = data.createdAt;
    }

    return this.repo.save(existing);
  }

  async delete(id: number): Promise<void> {
    const result = await this.repo.delete({ id });
    if (!result.affected) {
      throw new Error("Log not found");
    }
  }

  async getById(id: number): Promise<AuditLog> {
    const log = await this.repo.findOneBy({ id });
    if (!log) throw new Error("Log not found");
    return log;
  }

  async getAll(): Promise<AuditLog[]> {
    return this.repo.find({ order: { createdAt: "DESC" } });
  }

  async search(query: string): Promise<AuditLog[]> {
    const q = query?.trim();
    if (!q || q.length < 2) {
      throw new Error("Query must be at least 2 characters long");
    }
    return this.repo.find({
      where: { description: Like(`%${q}%`) },
      order: { createdAt: "DESC" },
    });
  }

  private validateType(type?: LogType) {
    if (!type || !Object.values(LogType).includes(type)) {
      throw new Error("Invalid log type");
    }
  }

  private validateDescription(desc?: string) {
    if (!desc || !desc.trim() || desc.trim().length < 3) {
      throw new Error("Description must have at least 3 characters");
    }
  }
}
