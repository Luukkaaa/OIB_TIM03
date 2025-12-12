import { Request, Response, Router } from "express";
import { IPlantService } from "../../Domain/services/IPlantService";
import { AuditLogClient } from "../../Services/AuditLogClient";
import { LogType } from "../../Services/LogType";
import { PlantState } from "../../Domain/enums/PlantState";

export class ReportController {
  private readonly router: Router;

  constructor(private readonly plantService: IPlantService, private readonly audit: AuditLogClient) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get("/reports/plants/summary", this.summary.bind(this));
    this.router.get("/reports/plants/summary/export", this.exportSummary.bind(this));
  }

  private parseFilters(req: Request) {
    const fromRaw = req.query.from as string | undefined;
    const toRaw = req.query.to as string | undefined;
    const stateRaw = (req.query.state as string | undefined)?.toUpperCase();

    const from = fromRaw ? new Date(fromRaw) : undefined;
    const to = toRaw ? new Date(toRaw) : undefined;
    if (from && isNaN(from.getTime())) throw new Error("Neispravan datum 'from'");
    if (to && isNaN(to.getTime())) throw new Error("Neispravan datum 'to'");

    if (stateRaw && !Object.values(PlantState).includes(stateRaw as PlantState)) {
      throw new Error("Nepoznat plant state");
    }

    return { from, to, state: stateRaw as PlantState | undefined };
  }

  private async summary(req: Request, res: Response): Promise<void> {
    try {
      const filters = this.parseFilters(req);
      const summary = await this.plantService.getSummary(filters);
      res.status(200).json({ success: true, data: summary });
    } catch (err) {
      await this.safeAudit(LogType.ERROR, `Rezime biljaka neuspesan: ${(err as Error).message}`);
      res.status(400).json({ success: false, message: (err as Error).message });
    }
  }

  private async exportSummary(req: Request, res: Response): Promise<void> {
    try {
      const filters = this.parseFilters(req);
      const exportData = await this.plantService.exportSummaryCSV(filters);
      res.setHeader("Content-Type", exportData.contentType);
      res.setHeader("Content-Disposition", `attachment; filename="${exportData.filename}"`);
      res.status(200).send(exportData.content);
    } catch (err) {
      await this.safeAudit(LogType.ERROR, `Export rezimea biljaka neuspesan: ${(err as Error).message}`);
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
