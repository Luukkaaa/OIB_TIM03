import { ReportStatus } from "./ReportStatus";
import { ReportType } from "./ReportType";

export type ReportDTO = {
  id: number;
  title: string;
  type: ReportType;
  status: ReportStatus;
  format: string;
  filePath?: string | null;
  lastRunAt?: string | null;
  errorMessage?: string | null;
  filters?: any;
};
