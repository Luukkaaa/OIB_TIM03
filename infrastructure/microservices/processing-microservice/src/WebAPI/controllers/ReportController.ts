import { Request, Response, Router } from "express";
import { IPerfumeService } from "../../Domain/services/IPerfumeService";
import { AuditLogClient } from "../../Services/AuditLogClient";
import { LogType } from "../../Services/LogType";
import { PerfumeType } from "../../Domain/enums/PerfumeType";

export class ReportController {
  private readonly router: Router;

  constructor(private readonly perfumeService: IPerfumeService, private readonly audit: AuditLogClient) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get("/reports/perfumes/summary", this.summary.bind(this));
    this.router.get("/reports/perfumes/summary/export", this.exportSummary.bind(this));
  }

  private parseFilters(req: Request) {
    const fromRaw = req.query.from as string | undefined;
    const toRaw = req.query.to as string | undefined;
    const typeRaw = (req.query.type as string | undefined)?.toUpperCase();

    const from = fromRaw ? new Date(fromRaw) : undefined;
    const to = toRaw ? new Date(toRaw) : undefined;
    if (from && isNaN(from.getTime())) throw new Error("Neispravan datum 'from'");
    if (to && isNaN(to.getTime())) throw new Error("Neispravan datum 'to'");

    if (typeRaw && !Object.values(PerfumeType).includes(typeRaw as PerfumeType)) {
      throw new Error("Nepoznat tip parfema");
    }

    return { from, to, type: typeRaw as PerfumeType | undefined };
  }

  private async summary(req: Request, res: Response): Promise<void> {
    try {
      const filters = this.parseFilters(req);
      const summary = await this.perfumeService.getSummary(filters);
      res.status(200).json({ success: true, data: summary });
    } catch (err) {
      await this.safeAudit(LogType.ERROR, `Rezime parfema neuspesan: ${(err as Error).message}`);
      res.status(400).json({ success: false, message: (err as Error).message });
    }
  }

  private async exportSummary(req: Request, res: Response): Promise<void> {
    try {
      const filters = this.parseFilters(req);
      const exportData = await this.perfumeService.exportSummaryCSV(filters);
      res.setHeader("Content-Type", exportData.contentType);
      res.setHeader("Content-Disposition", `attachment; filename=\"${exportData.filename}\"`);
      res.status(200).send(exportData.content);
    } catch (err) {
      await this.safeAudit(LogType.ERROR, `Export rezimea parfema neuspesan: ${(err as Error).message}`);
      res.status(400).json({ success: false, message: (err as Error).message });
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
