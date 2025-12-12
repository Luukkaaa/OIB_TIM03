import { ReportStatus } from "../enums/ReportStatus";
import { ReportType } from "../enums/ReportType";

export interface ReportDTO {
  id: number;
  title: string;
  type: ReportType;
  status: ReportStatus;
  format: string;
  filePath?: string | null;
  lastRunAt?: string | null;
  errorMessage?: string | null;
  filters?: any;
}
