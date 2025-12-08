import { Request, Response, Router } from "express";
import { IPackagingService } from "../../Domain/services/IPackagingService";
import { validateCreatePackaging, validateUpdatePackaging, validatePackRequest, validateSendRequest } from "../validators/PackagingValidators";
import { CreatePackagingDTO } from "../../Domain/DTOs/CreatePackagingDTO";
import { UpdatePackagingDTO } from "../../Domain/DTOs/UpdatePackagingDTO";
import { AuditLogClient } from "../../Services/AuditLogClient";
import { LogType } from "../../Services/LogType";
import { PackRequestDTO } from "../../Domain/DTOs/PackRequestDTO";
import { SendRequestDTO } from "../../Domain/DTOs/SendRequestDTO";

export class PackagingController {
  private readonly router: Router;

  constructor(private readonly packagingService: IPackagingService, private readonly audit: AuditLogClient) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post("/packagings", this.create.bind(this));
    this.router.get("/packagings", this.getAll.bind(this));
    this.router.get("/packagings/search/:q", this.search.bind(this));
    this.router.get("/packagings/:id", this.getById.bind(this));
    this.router.put("/packagings/:id", this.update.bind(this));
    this.router.delete("/packagings/:id", this.delete.bind(this));
    this.router.post("/packagings/pack", this.pack.bind(this));
    this.router.post("/packagings/send", this.send.bind(this));
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
      const data = req.body as CreatePackagingDTO;
      const validation = validateCreatePackaging(data);
      if (!validation.success) {
        await this.safeAudit(LogType.WARNING, `Nevalidan zahtev za kreiranje ambalaze: ${validation.message}`);
        res.status(400).json({ success: false, message: validation.message });
        return;
      }
      const created = await this.packagingService.create(data);
      res.status(201).json({ success: true, data: created });
    } catch (err) {
      await this.safeAudit(LogType.ERROR, `Kreiranje ambalaze neuspesно: ${(err as Error).message}`);
      res.status(400).json({ success: false, message: (err as Error).message });
    }
  }

  private async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id ?? "0", 10);
      const data = req.body as UpdatePackagingDTO;
      const validation = validateUpdatePackaging(data);
      if (!validation.success) {
        await this.safeAudit(LogType.WARNING, `Nevalidan zahtev za azuriranje ambalaze ${id}: ${validation.message}`);
        res.status(400).json({ success: false, message: validation.message });
        return;
      }
      const updated = await this.packagingService.update(id, data);
      res.status(200).json({ success: true, data: updated });
    } catch (err) {
      await this.safeAudit(LogType.ERROR, `Azuriranje ambalaze neuspesno: ${(err as Error).message}`);
      res.status(400).json({ success: false, message: (err as Error).message });
    }
  }

  private async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id ?? "0", 10);
      await this.packagingService.delete(id);
      res.status(204).send();
    } catch (err) {
      await this.safeAudit(LogType.ERROR, `Brisanje ambalaze neuspesno: ${(err as Error).message}`);
      res.status(404).json({ success: false, message: (err as Error).message });
    }
  }

  private async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id ?? "0", 10);
      const packaging = await this.packagingService.getById(id);
      res.status(200).json({ success: true, data: packaging });
    } catch (err) {
      await this.safeAudit(LogType.ERROR, `Ambalaza nije pronadjena: ${(err as Error).message}`);
      res.status(404).json({ success: false, message: (err as Error).message });
    }
  }

  private async getAll(_: Request, res: Response): Promise<void> {
    try {
      const items = await this.packagingService.getAll();
      res.status(200).json({ success: true, data: items });
    } catch (err) {
      await this.safeAudit(LogType.ERROR, `Greska pri dohvatanju ambalaza: ${(err as Error).message}`);
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  private async search(req: Request, res: Response): Promise<void> {
    try {
      const q = req.params.q ?? "";
      const items = await this.packagingService.search(q);
      res.status(200).json({ success: true, data: items });
    } catch (err) {
      await this.safeAudit(LogType.ERROR, `Pretraga ambalaza neuspesna: ${(err as Error).message}`);
      res.status(400).json({ success: false, message: (err as Error).message });
    }
  }

  public getRouter(): Router {
    return this.router;
  }

  private async pack(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body as PackRequestDTO;
      const validation = validatePackRequest(data);
      if (!validation.success) {
        await this.safeAudit(LogType.WARNING, `Nevalidan zahtev za pakovanje: ${validation.message}`);
        res.status(400).json({ success: false, message: validation.message });
        return;
      }
      const packed = await this.packagingService.pack(data);
      res.status(201).json({ success: true, data: packed });
    } catch (err) {
      await this.safeAudit(LogType.ERROR, `Pakovanje neuspesno: ${(err as Error).message}`);
      res.status(400).json({ success: false, message: (err as Error).message });
    }
  }

  private async send(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body as SendRequestDTO;
      const validation = validateSendRequest(data);
      if (!validation.success) {
        await this.safeAudit(LogType.WARNING, `Nevalidan zahtev za slanje ambalaze: ${validation.message}`);
        res.status(400).json({ success: false, message: validation.message });
        return;
      }
      const updated = await this.packagingService.send(data);
      res.status(200).json({ success: true, data: updated });
    } catch (err) {
      await this.safeAudit(LogType.ERROR, `Slanje ambalaze neuspesno: ${(err as Error).message}`);
      res.status(400).json({ success: false, message: (err as Error).message });
    }
  }
}
