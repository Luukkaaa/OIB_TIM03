import { Request, Response, Router } from "express";
import { IReportService } from "../../Domain/services/IReportService";
import { AuditLogClient } from "../../Services/AuditLogClient";
import { LogType } from "../../Services/LogType";
import { CreateReportDTO } from "../../Domain/DTOs/CreateReportDTO";
import { RunReportDTO } from "../../Domain/DTOs/RunReportDTO";

export class ReportController {
  private readonly router: Router;

  constructor(private readonly reportService: IReportService, private readonly audit: AuditLogClient) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post("/reports", this.create.bind(this));
    this.router.get("/reports", this.list.bind(this));
    this.router.get("/reports/:id", this.getById.bind(this));
    this.router.post("/reports/:id/run", this.run.bind(this));
    this.router.get("/reports/:id/download", this.download.bind(this));
  }

  private async create(req: Request, res: Response): Promise<void> {
    try {
      const dto = req.body as CreateReportDTO;
      const created = await this.reportService.create(dto);
      res.status(201).json({ success: true, data: created });
    } catch (err) {
      await this.safeAudit(LogType.ERROR, `Kreiranje reporta neuspesno: ${(err as Error).message}`);
      res.status(400).json({ success: false, message: (err as Error).message });
    }
  }

  private async list(_: Request, res: Response): Promise<void> {
    try {
      const items = await this.reportService.list();
      res.status(200).json({ success: true, data: items });
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  private async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id ?? "0", 10);
      const report = await this.reportService.getById(id);
      res.status(200).json({ success: true, data: report });
    } catch (err) {
      res.status(404).json({ success: false, message: (err as Error).message });
    }
  }

  private async run(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id ?? "0", 10);
      const dto = req.body as RunReportDTO;
      const report = await this.reportService.run(id, dto);
      res.status(200).json({ success: true, data: report });
    } catch (err) {
      await this.safeAudit(LogType.ERROR, `Generisanje reporta neuspesno: ${(err as Error).message}`);
      res.status(400).json({ success: false, message: (err as Error).message });
    }
  }

  private async download(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id ?? "0", 10);
      const file = await this.reportService.download(id);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="${file.filename}"`);
      res.status(200).sendFile(file.filePath);
    } catch (err) {
      await this.safeAudit(LogType.ERROR, `Preuzimanje reporta neuspesno: ${(err as Error).message}`);
      res.status(404).json({ success: false, message: (err as Error).message });
    }
  }

  private async safeAudit(type: LogType, message: string): Promise<void> {
    try {
      await this.audit.log(type, message);
    } catch {
      /* ignore */
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}
