import { Request, Response, Router } from "express";
import { IUsersService } from "../../Domain/services/IUsersService";
import { AuditLogClient } from "../../Services/AuditLogClient";
import { LogType } from "../../audit-types/LogType";

export class ReportController {
  private readonly router: Router;

  constructor(private readonly usersService: IUsersService, private readonly audit: AuditLogClient) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get("/reports/users/summary", this.summary.bind(this));
    this.router.get("/reports/users/summary/export", this.exportSummary.bind(this));
  }

  private async summary(_: Request, res: Response): Promise<void> {
    try {
      const summary = await this.usersService.getSummary();
      res.status(200).json({ success: true, data: summary });
    } catch (err) {
      await this.safeAudit(LogType.ERROR, `Rezime korisnika neuspesan: ${(err as Error).message}`);
      res.status(400).json({ success: false, message: (err as Error).message });
    }
  }

  private async exportSummary(_: Request, res: Response): Promise<void> {
    try {
      const summary = await this.usersService.getSummary();
      const filename = "users-summary.csv";
      const lines: string[] = [];
      lines.push("metric,value");
      lines.push(`totalCount,${summary.totalCount}`);
      lines.push("");
      lines.push("byRole,count");
      summary.byRole.forEach((r: { role: string; count: number }) => lines.push(`${r.role},${r.count}`));

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.status(200).send(lines.join("\n"));
    } catch (err) {
      await this.safeAudit(LogType.ERROR, `Export rezimea korisnika neuspesan: ${(err as Error).message}`);
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
