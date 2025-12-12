import { Repository } from "typeorm";
import fs from "fs";
import path from "path";
import { IReportService } from "../Domain/services/IReportService";
import { Report } from "../Domain/models/Report";
import { CreateReportDTO } from "../Domain/DTOs/CreateReportDTO";
import { RunReportDTO } from "../Domain/DTOs/RunReportDTO";
import { ReportStatus } from "../Domain/enums/ReportStatus";
import { ReportType } from "../Domain/enums/ReportType";
import { SummaryClient } from "./SummaryClient";
import { toCsv } from "./ReportGenerator";
import { AuditLogClient } from "./AuditLogClient";
import { LogType } from "./LogType";

export class ReportService implements IReportService {
  private readonly storageDir: string;

  constructor(
    private readonly repo: Repository<Report>,
    private readonly summaryClient: SummaryClient,
    private readonly audit: AuditLogClient
  ) {
    this.storageDir = path.join(process.cwd(), "storage", "reports");
  }

  async create(dto: CreateReportDTO): Promise<Report> {
    if (!dto.title?.trim()) throw new Error("Title is required");
    if (!Object.values(ReportType).includes(dto.type)) throw new Error("Invalid report type");
    const entity = this.repo.create({
      title: dto.title.trim(),
      type: dto.type,
      status: ReportStatus.PENDING,
      filters: dto.filters ? JSON.stringify(dto.filters) : null,
      format: dto.format ?? "csv",
    });
    const saved = await this.repo.save(entity);
    await this.audit.log(LogType.INFO, `Kreiran report template ${saved.title} (${saved.type})`);
    return saved;
  }

  async list(): Promise<Report[]> {
    return this.repo.find({ order: { updatedAt: "DESC" } });
  }

  async getById(id: number): Promise<Report> {
    const report = await this.repo.findOne({ where: { id } });
    if (!report) throw new Error("Report not found");
    return report;
  }

  private ensureStorage() {
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }
  }

  async run(id: number, data: RunReportDTO): Promise<Report> {
    const report = await this.getById(id);
    report.status = ReportStatus.RUNNING;
    report.errorMessage = null;
    await this.repo.save(report);

    try {
      let filters: Record<string, unknown> = {};
      if (typeof data.filters === "string") {
        try {
          filters = JSON.parse(data.filters);
        } catch {
          filters = {};
        }
      } else if (data.filters && typeof data.filters === "object") {
        filters = data.filters as Record<string, unknown>;
      } else if (report.filters) {
        try {
          filters = JSON.parse(report.filters);
        } catch {
          filters = {};
        }
      }

      const summary = await this.summaryClient.fetchSummary(report.type, filters);
      const csv = toCsv(report.type, summary);

      this.ensureStorage();
      const filename = `${report.id}-${Date.now()}-${csv.filename}`;
      const filePath = path.join(this.storageDir, filename);
      fs.writeFileSync(filePath, csv.content, "utf8");

      report.status = ReportStatus.READY;
      report.filePath = filePath;
      report.lastRunAt = new Date();
      report.format = "csv";
      await this.repo.save(report);
      await this.audit.log(LogType.INFO, `Report ${report.id} generisan i sacuvan (${csv.filename})`);
      return report;
    } catch (err: any) {
      report.status = ReportStatus.FAILED;
      report.errorMessage = err?.message ?? "Report generation failed";
      await this.repo.save(report);
      await this.audit.log(LogType.ERROR, `Report ${report.id} neuspesan: ${report.errorMessage}`);
      throw new Error(report.errorMessage ?? "Report generation failed");
    }
  }

  async download(id: number): Promise<{ filePath: string; filename: string }> {
    const report = await this.getById(id);
    if (!report.filePath || report.status !== ReportStatus.READY) {
      throw new Error("Report nije spreman za preuzimanje");
    }
    const filename = path.basename(report.filePath);
    return { filePath: report.filePath, filename };
  }
}
