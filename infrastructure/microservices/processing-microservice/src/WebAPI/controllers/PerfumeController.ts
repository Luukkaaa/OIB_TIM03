import { Request, Response, Router } from "express";
import { IPerfumeService } from "../../Domain/services/IPerfumeService";
import { validateCreatePerfume, validateUpdatePerfume } from "../validators/PerfumeValidators";
import { CreatePerfumeDTO } from "../../Domain/DTOs/CreatePerfumeDTO";
import { UpdatePerfumeDTO } from "../../Domain/DTOs/UpdatePerfumeDTO";
import { AuditLogClient } from "../../Services/AuditLogClient";
import { LogType } from "../../Services/LogType";

export class PerfumeController {
  private readonly router: Router;

  constructor(private readonly perfumeService: IPerfumeService, private readonly audit: AuditLogClient) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post("/perfumes", this.create.bind(this));
    this.router.get("/perfumes", this.getAll.bind(this));
    this.router.get("/perfumes/search/:q", this.search.bind(this));
    this.router.get("/perfumes/:id", this.getById.bind(this));
    this.router.put("/perfumes/:id", this.update.bind(this));
    this.router.delete("/perfumes/:id", this.delete.bind(this));
  }

  private async safeAudit(type: LogType, message: string): Promise<void> {
    try {
      await this.audit.log(type, message);
    } catch {
      /* ignore audit error */
    }
  }

  private async create(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body as CreatePerfumeDTO;
      const validation = validateCreatePerfume(data);
      if (!validation.success) {
        await this.safeAudit(LogType.WARNING, `Nevalidan zahtev za kreiranje parfema: ${validation.message}`);
        res.status(400).json({ success: false, message: validation.message });
        return;
      }
      const created = await this.perfumeService.create(data);
      res.status(201).json({ success: true, data: created });
    } catch (err) {
      await this.safeAudit(LogType.ERROR, `Kreiranje parfema neuspesno: ${(err as Error).message}`);
      res.status(400).json({ success: false, message: (err as Error).message });
    }
  }

  private async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id ?? "0", 10);
      const data = req.body as UpdatePerfumeDTO;
      const validation = validateUpdatePerfume(data);
      if (!validation.success) {
        await this.safeAudit(LogType.WARNING, `Nevalidan zahtev za azuriranje parfema ${id}: ${validation.message}`);
        res.status(400).json({ success: false, message: validation.message });
        return;
      }
      const updated = await this.perfumeService.update(id, data);
      res.status(200).json({ success: true, data: updated });
    } catch (err) {
      await this.safeAudit(LogType.ERROR, `Azuriranje parfema neuspesно: ${(err as Error).message}`);
      res.status(400).json({ success: false, message: (err as Error).message });
    }
  }

  private async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id ?? "0", 10);
      await this.perfumeService.delete(id);
      res.status(204).send();
    } catch (err) {
      await this.safeAudit(LogType.ERROR, `Brisanje parfema neuspesno: ${(err as Error).message}`);
      res.status(404).json({ success: false, message: (err as Error).message });
    }
  }

  private async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id ?? "0", 10);
      const perfume = await this.perfumeService.getById(id);
      res.status(200).json({ success: true, data: perfume });
    } catch (err) {
      await this.safeAudit(LogType.ERROR, `Parfem nije pronadjen: ${(err as Error).message}`);
      res.status(404).json({ success: false, message: (err as Error).message });
    }
  }

  private async getAll(_: Request, res: Response): Promise<void> {
    try {
      const perfumes = await this.perfumeService.getAll();
      res.status(200).json({ success: true, data: perfumes });
    } catch (err) {
      await this.safeAudit(LogType.ERROR, `Greska pri dohvatanju parfema: ${(err as Error).message}`);
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  private async search(req: Request, res: Response): Promise<void> {
    try {
      const q = req.params.q ?? "";
      const perfumes = await this.perfumeService.search(q);
      res.status(200).json({ success: true, data: perfumes });
    } catch (err) {
      await this.safeAudit(LogType.ERROR, `Pretraga parfema neuspesna: ${(err as Error).message}`);
      res.status(400).json({ success: false, message: (err as Error).message });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}
