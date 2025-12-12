import { Report } from "../models/Report";
import { CreateReportDTO } from "../DTOs/CreateReportDTO";
import { RunReportDTO } from "../DTOs/RunReportDTO";

export interface IReportService {
  create(dto: CreateReportDTO): Promise<Report>;
  list(): Promise<Report[]>;
  getById(id: number): Promise<Report>;
  run(id: number, data: RunReportDTO): Promise<Report>;
  download(id: number): Promise<{ filePath: string; filename: string }>;
}
