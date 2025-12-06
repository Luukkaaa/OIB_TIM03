import { Request, Response, Router } from "express";
import { IWarehouseService } from "../../Domain/services/IWarehouseService";
import { validateCreateWarehouse, validateUpdateWarehouse } from "../validators/WarehouseValidators";
import { CreateWarehouseDTO } from "../../Domain/DTOs/CreateWarehouseDTO";
import { UpdateWarehouseDTO } from "../../Domain/DTOs/UpdateWarehouseDTO";
import { AuditLogClient } from "../../Services/AuditLogClient";
import { LogType } from "../../Services/LogType";

export class WarehouseController {
  private readonly router: Router;

  constructor(private readonly warehouseService: IWarehouseService, private readonly audit: AuditLogClient) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post("/warehouses", this.create.bind(this));
    this.router.get("/warehouses", this.getAll.bind(this));
    this.router.get("/warehouses/search/:q", this.search.bind(this));
    this.router.get("/warehouses/:id", this.getById.bind(this));
    this.router.put("/warehouses/:id", this.update.bind(this));
    this.router.delete("/warehouses/:id", this.delete.bind(this));
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
      const data = req.body as CreateWarehouseDTO;
      const validation = validateCreateWarehouse(data);
      if (!validation.success) {
        await this.safeAudit(LogType.WARNING, `Nevalidan zahtev za kreiranje skladista: ${validation.message}`);
        res.status(400).json({ success: false, message: validation.message });
        return;
      }
      const created = await this.warehouseService.create(data);
      res.status(201).json({ success: true, data: created });
    } catch (err) {
      await this.safeAudit(LogType.ERROR, `Kreiranje skladista neuspesno: ${(err as Error).message}`);
      res.status(400).json({ success: false, message: (err as Error).message });
    }
  }

  private async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id ?? "0", 10);
      const data = req.body as UpdateWarehouseDTO;
      const validation = validateUpdateWarehouse(data);
      if (!validation.success) {
        await this.safeAudit(LogType.WARNING, `Nevalidan zahtev za azuriranje skladista ${id}: ${validation.message}`);
        res.status(400).json({ success: false, message: validation.message });
        return;
      }
      const updated = await this.warehouseService.update(id, data);
      res.status(200).json({ success: true, data: updated });
    } catch (err) {
      await this.safeAudit(LogType.ERROR, `Azuriranje skladista neuspesno: ${(err as Error).message}`);
      res.status(400).json({ success: false, message: (err as Error).message });
    }
  }

  private async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id ?? "0", 10);
      await this.warehouseService.delete(id);
      res.status(204).send();
    } catch (err) {
      await this.safeAudit(LogType.ERROR, `Brisanje skladista neuspesno: ${(err as Error).message}`);
      res.status(404).json({ success: false, message: (err as Error).message });
    }
  }

  private async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id ?? "0", 10);
      const wh = await this.warehouseService.getById(id);
      res.status(200).json({ success: true, data: wh });
    } catch (err) {
      await this.safeAudit(LogType.ERROR, `Skladiste nije pronadjeno: ${(err as Error).message}`);
      res.status(404).json({ success: false, message: (err as Error).message });
    }
  }

  private async getAll(_: Request, res: Response): Promise<void> {
    try {
      const items = await this.warehouseService.getAll();
      res.status(200).json({ success: true, data: items });
    } catch (err) {
      await this.safeAudit(LogType.ERROR, `Greska pri dohvatanju skladista: ${(err as Error).message}`);
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  private async search(req: Request, res: Response): Promise<void> {
    try {
      const q = req.params.q ?? "";
      const items = await this.warehouseService.search(q);
      res.status(200).json({ success: true, data: items });
    } catch (err) {
      await this.safeAudit(LogType.ERROR, `Pretraga skladista neuspesna: ${(err as Error).message}`);
      res.status(400).json({ success: false, message: (err as Error).message });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}
