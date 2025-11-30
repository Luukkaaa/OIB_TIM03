import { LogType } from "../enums/LogType";

export interface AuditLogDTO {
  id: number;
  type: LogType;
  createdAt: string;
  description: string;
}
