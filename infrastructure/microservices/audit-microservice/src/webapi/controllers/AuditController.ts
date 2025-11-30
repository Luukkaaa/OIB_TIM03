import { Request, Response, Router } from "express";
import { IAuditService } from "../../domain/services/IAuditService";
import { validateCreate, validateUpdate } from "../validators/AuditValidators";
import { CreateAuditLogDTO } from "../../domain/DTOs/CreateAuditLogDTO";
import { UpdateAuditLogDTO } from "../../domain/DTOs/UpdateAuditLogDTO";

export class AuditController {
  private readonly router: Router;

  constructor(private readonly auditService: IAuditService) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post("/logs", this.create.bind(this));
    this.router.get("/logs", this.getAll.bind(this));
    this.router.get("/logs/search/:q", this.search.bind(this));
    this.router.get("/logs/:id", this.getById.bind(this));
    this.router.put("/logs/:id", this.update.bind(this));
    this.router.delete("/logs/:id", this.delete.bind(this));
  }

  private async create(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body as CreateAuditLogDTO;
      const validation = validateCreate(data);
      if (!validation.success) {
        res.status(400).json({ success: false, message: validation.message });
        return;
      }

      const created = await this.auditService.create(data);
      res.status(201).json({ success: true, data: created });
    } catch (err) {
      res.status(400).json({ success: false, message: (err as Error).message });
    }
  }

  private async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id ?? "0", 10);
      const data = req.body as UpdateAuditLogDTO;
      const validation = validateUpdate(data);
      if (!validation.success) {
        res.status(400).json({ success: false, message: validation.message });
        return;
      }

      const updated = await this.auditService.update(id, data);
      res.status(200).json({ success: true, data: updated });
    } catch (err) {
      res.status(400).json({ success: false, message: (err as Error).message });
    }
  }

  private async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id ?? "0", 10);
      await this.auditService.delete(id);
      res.status(204).send();
    } catch (err) {
      res.status(404).json({ success: false, message: (err as Error).message });
    }
  }

  private async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id ?? "0", 10);
      const log = await this.auditService.getById(id);
      res.status(200).json({ success: true, data: log });
    } catch (err) {
      res.status(404).json({ success: false, message: (err as Error).message });
    }
  }

  private async getAll(_: Request, res: Response): Promise<void> {
    try {
      const logs = await this.auditService.getAll();
      res.status(200).json({ success: true, data: logs });
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  private async search(req: Request, res: Response): Promise<void> {
    try {
      const q = req.params.q ?? "";
      const logs = await this.auditService.search(q);
      res.status(200).json({ success: true, data: logs });
    } catch (err) {
      res.status(400).json({ success: false, message: (err as Error).message });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}
