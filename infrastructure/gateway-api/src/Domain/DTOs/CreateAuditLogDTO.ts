import { LogType } from "../enums/LogType";

export interface CreateAuditLogDTO {
  type: LogType;
  description: string;
  createdAt?: string;
}
