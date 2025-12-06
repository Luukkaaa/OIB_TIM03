import { Request, Response, Router } from "express";
import { ISaleService } from "../../Domain/services/ISaleService";
import { validateCreateSale, validateUpdateSale } from "../validators/SaleValidators";
import { CreateSaleDTO } from "../../Domain/DTOs/CreateSaleDTO";
import { UpdateSaleDTO } from "../../Domain/DTOs/UpdateSaleDTO";
import { AuditLogClient } from "../../Services/AuditLogClient";
import { LogType } from "../../Services/LogType";

export class SaleController {
  private readonly router: Router;

  constructor(private readonly saleService: ISaleService, private readonly audit: AuditLogClient) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post("/sales", this.create.bind(this));
    this.router.get("/sales", this.getAll.bind(this));
    this.router.get("/sales/search/:q", this.search.bind(this));
    this.router.get("/sales/:id", this.getById.bind(this));
    this.router.put("/sales/:id", this.update.bind(this));
    this.router.delete("/sales/:id", this.delete.bind(this));
  }

  private async safeAudit(type: LogType, message: string): Promise<void> {
    try {
      await this.audit.log(type, message);
    } catch {
      /* ignore */
    }
  }

  private async create(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body as CreateSaleDTO;
      const validation = validateCreateSale(data);
      if (!validation.success) {
        await this.safeAudit(LogType.WARNING, `Nevalidan zahtev za kreiranje prodaje: ${validation.message}`);
        res.status(400).json({ success: false, message: validation.message });
        return;
      }
      const created = await this.saleService.create(data);
      res.status(201).json({ success: true, data: created });
    } catch (err) {
      await this.safeAudit(LogType.ERROR, `Kreiranje prodaje neuspesno: ${(err as Error).message}`);
      res.status(400).json({ success: false, message: (err as Error).message });
    }
  }

  private async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id ?? "0", 10);
      const data = req.body as UpdateSaleDTO;
      const validation = validateUpdateSale(data);
      if (!validation.success) {
        await this.safeAudit(LogType.WARNING, `Nevalidan zahtev za azuriranje prodaje ${id}: ${validation.message}`);
        res.status(400).json({ success: false, message: validation.message });
        return;
      }
      const updated = await this.saleService.update(id, data);
      res.status(200).json({ success: true, data: updated });
    } catch (err) {
      await this.safeAudit(LogType.ERROR, `Azuriranje prodaje neuspesno: ${(err as Error).message}`);
      res.status(400).json({ success: false, message: (err as Error).message });
    }
  }

  private async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id ?? "0", 10);
      await this.saleService.delete(id);
      res.status(204).send();
    } catch (err) {
      await this.safeAudit(LogType.ERROR, `Brisanje prodaje neuspesno: ${(err as Error).message}`);
      res.status(404).json({ success: false, message: (err as Error).message });
    }
  }

  private async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id ?? "0", 10);
      const sale = await this.saleService.getById(id);
      res.status(200).json({ success: true, data: sale });
    } catch (err) {
      await this.safeAudit(LogType.ERROR, `Prodaja nije pronadjena: ${(err as Error).message}`);
      res.status(404).json({ success: false, message: (err as Error).message });
    }
  }

  private async getAll(_: Request, res: Response): Promise<void> {
    try {
      const items = await this.saleService.getAll();
      res.status(200).json({ success: true, data: items });
    } catch (err) {
      await this.safeAudit(LogType.ERROR, `Greska pri dohvatanju prodaja: ${(err as Error).message}`);
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  private async search(req: Request, res: Response): Promise<void> {
    try {
      const q = req.params.q ?? "";
      const items = await this.saleService.search(q);
      res.status(200).json({ success: true, data: items });
    } catch (err) {
      await this.safeAudit(LogType.ERROR, `Pretraga prodaja neuspesна: ${(err as Error).message}`);
      res.status(400).json({ success: false, message: (err as Error).message });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}
