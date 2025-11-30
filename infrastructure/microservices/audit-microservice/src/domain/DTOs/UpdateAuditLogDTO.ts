import { LogType } from "../enums/LogType";

export interface UpdateAuditLogDTO {
  type?: LogType;
  description?: string;
  createdAt?: Date;
}
