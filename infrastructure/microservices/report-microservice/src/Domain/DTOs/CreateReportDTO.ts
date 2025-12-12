import { ReportType } from "../enums/ReportType";

export interface CreateReportDTO {
  title: string;
  type: ReportType;
  filters?: Record<string, unknown>;
  format?: "csv";
}
