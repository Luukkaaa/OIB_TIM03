import { CreateAuditLogDTO } from "../../domain/DTOs/CreateAuditLogDTO";
import { UpdateAuditLogDTO } from "../../domain/DTOs/UpdateAuditLogDTO";
import { LogType } from "../../domain/enums/LogType";

export function validateCreate(data: CreateAuditLogDTO): { success: boolean; message?: string } {
  if (!data.type || !Object.values(LogType).includes(data.type)) {
    return { success: false, message: "Invalid log type" };
  }
  if (!data.description || !data.description.trim() || data.description.trim().length < 3) {
    return { success: false, message: "Description must have at least 3 characters" };
  }
  if (data.createdAt && isNaN(new Date(data.createdAt).getTime())) {
    return { success: false, message: "Invalid date" };
  }
  return { success: true };
}

export function validateUpdate(data: UpdateAuditLogDTO): { success: boolean; message?: string } {
  if (data.type && !Object.values(LogType).includes(data.type)) {
    return { success: false, message: "Invalid log type" };
  }
  if (data.description !== undefined && (!data.description.trim() || data.description.trim().length < 3)) {
    return { success: false, message: "Description must have at least 3 characters" };
  }
  if (data.createdAt && isNaN(new Date(data.createdAt).getTime())) {
    return { success: false, message: "Invalid date" };
  }
  return { success: true };
}
