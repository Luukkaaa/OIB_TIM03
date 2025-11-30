import { CreateAuditLogDTO } from "../DTOs/CreateAuditLogDTO";
import { UpdateAuditLogDTO } from "../DTOs/UpdateAuditLogDTO";
import { AuditLog } from "../models/AuditLog";

export interface IAuditService {
  create(data: CreateAuditLogDTO): Promise<AuditLog>;
  update(id: number, data: UpdateAuditLogDTO): Promise<AuditLog>;
  delete(id: number): Promise<void>;
  getById(id: number): Promise<AuditLog>;
  getAll(): Promise<AuditLog[]>;
  search(query: string): Promise<AuditLog[]>;
}
