import { ReportDTO } from "../../models/reports/ReportDTO";
import { ReportType } from "../../models/reports/ReportType";

export interface IReportAPI {
  listReports(token: string): Promise<ReportDTO[]>;
  createReport(token: string, data: { title: string; type: ReportType; filters?: any }): Promise<ReportDTO>;
  runReport(token: string, id: number, filters?: any): Promise<ReportDTO>;
  downloadReport(token: string, id: number): Promise<{ blob: Blob; filename: string; contentType: string }>;
}
