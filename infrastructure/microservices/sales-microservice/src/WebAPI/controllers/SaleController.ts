import { Request, Response, Router } from "express";
import { ISaleService } from "../../Domain/services/ISaleService";
import { validateCreateSale, validateUpdateSale } from "../validators/SaleValidators";
import { CreateSaleDTO } from "../../Domain/DTOs/CreateSaleDTO";
import { UpdateSaleDTO } from "../../Domain/DTOs/UpdateSaleDTO";
import { AuditLogClient } from "../../Services/AuditLogClient";
import { LogType } from "../../Services/LogType";
import { PaymentMethod } from "../../Domain/enums/PaymentMethod";
import { SaleType } from "../../Domain/enums/SaleType";

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
    this.router.get("/reports/sales/summary", this.summary.bind(this));
    this.router.get("/reports/sales/summary/export", this.exportSummary.bind(this));
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
      await this.safeAudit(LogType.ERROR, `Pretraga prodaja neuspesna: ${(err as Error).message}`);
      res.status(400).json({ success: false, message: (err as Error).message });
    }
  }

  private parseFilters(req: Request) {
    const fromRaw = req.query.from as string | undefined;
    const toRaw = req.query.to as string | undefined;
    const paymentMethod = (req.query.paymentMethod as string | undefined)?.toUpperCase();
    const saleType = (req.query.saleType as string | undefined)?.toUpperCase();

    const from = fromRaw ? new Date(fromRaw) : undefined;
    const to = toRaw ? new Date(toRaw) : undefined;
    if (from && isNaN(from.getTime())) throw new Error("Neispravan datum 'from'");
    if (to && isNaN(to.getTime())) throw new Error("Neispravan datum 'to'");

    if (paymentMethod && !Object.values(PaymentMethod).includes(paymentMethod as PaymentMethod)) {
      throw new Error("Nepoznat paymentMethod");
    }
    if (saleType && !Object.values(SaleType).includes(saleType as SaleType)) {
      throw new Error("Nepoznat saleType");
    }

    return {
      from,
      to,
      paymentMethod: paymentMethod as PaymentMethod | undefined,
      saleType: saleType as SaleType | undefined,
    };
  }

  private async summary(req: Request, res: Response): Promise<void> {
    try {
      const filters = this.parseFilters(req);
      const summary = await this.saleService.getSummary(filters);
      res.status(200).json({ success: true, data: summary });
    } catch (err) {
      await this.safeAudit(LogType.ERROR, `Rezime prodaja neuspesan: ${(err as Error).message}`);
      res.status(400).json({ success: false, message: (err as Error).message });
    }
  }

  private async exportSummary(req: Request, res: Response): Promise<void> {
    try {
      const filters = this.parseFilters(req);
      const format = (req.query.format as string | undefined)?.toLowerCase() || "csv";
      if (format !== "csv") {
        res.status(400).json({ success: false, message: "Podrzan je samo CSV export" });
        return;
      }
      const exportData = await this.saleService.exportSummaryCSV(filters);
      res.setHeader("Content-Type", exportData.contentType);
      res.setHeader("Content-Disposition", `attachment; filename="${exportData.filename}"`);
      res.status(200).send(exportData.content);
    } catch (err) {
      await this.safeAudit(LogType.ERROR, `Export rezimea prodaja neuspesan: ${(err as Error).message}`);
      res.status(400).json({ success: false, message: (err as Error).message });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}
