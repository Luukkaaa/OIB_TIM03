import { Request, Response, Router } from "express";
import { IPlantService } from "../../Domain/services/IPlantService";
import { validateCreatePlant, validateUpdatePlant } from "../validators/PlantValidators";
import { CreatePlantDTO } from "../../Domain/DTOs/CreatePlantDTO";
import { UpdatePlantDTO } from "../../Domain/DTOs/UpdatePlantDTO";
import { AuditLogClient } from "../../Services/AuditLogClient";
import { LogType } from "../../Services/LogType";

export class PlantController {
  private readonly router: Router;

  constructor(private readonly plantService: IPlantService, private readonly audit: AuditLogClient) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post("/plants", this.create.bind(this));
    this.router.get("/plants", this.getAll.bind(this));
    this.router.get("/plants/search/:q", this.search.bind(this));
    this.router.get("/plants/:id", this.getById.bind(this));
    this.router.put("/plants/:id", this.update.bind(this));
    this.router.delete("/plants/:id", this.delete.bind(this));
  }

  private async safeAudit(type: LogType, message: string): Promise<void> {
    try {
      await this.audit.log(type, message);
    } catch {
      /* swallow audit errors */
    }
  }

  private async create(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body as CreatePlantDTO;
      const validation = validateCreatePlant(data);
      if (!validation.success) {
        await this.safeAudit(LogType.WARNING, `Nevalidan zahtev za kreiranje biljke: ${validation.message}`);
        res.status(400).json({ success: false, message: validation.message });
        return;
      }

      const created = await this.plantService.create(data);
      res.status(201).json({ success: true, data: created });
    } catch (err) {
      await this.safeAudit(LogType.ERROR, `Kreiranje biljke neuspesno: ${(err as Error).message}`);
      res.status(400).json({ success: false, message: (err as Error).message });
    }
  }

  private async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id ?? "0", 10);
      const data = req.body as UpdatePlantDTO;
      const validation = validateUpdatePlant(data);
      if (!validation.success) {
        await this.safeAudit(LogType.WARNING, `Nevalidan zahtev za azuriranje biljke ${id}: ${validation.message}`);
        res.status(400).json({ success: false, message: validation.message });
        return;
      }

      const updated = await this.plantService.update(id, data);
      res.status(200).json({ success: true, data: updated });
    } catch (err) {
      await this.safeAudit(LogType.ERROR, `Azuriranje biljke neuspesno: ${(err as Error).message}`);
      res.status(400).json({ success: false, message: (err as Error).message });
    }
  }

  private async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id ?? "0", 10);
      await this.plantService.delete(id);
      res.status(204).send();
    } catch (err) {
      await this.safeAudit(LogType.ERROR, `Brisanje biljke neuspesno: ${(err as Error).message}`);
      res.status(404).json({ success: false, message: (err as Error).message });
    }
  }

  private async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id ?? "0", 10);
      const plant = await this.plantService.getById(id);
      res.status(200).json({ success: true, data: plant });
    } catch (err) {
      await this.safeAudit(LogType.ERROR, `Biljka nije pronadjena: ${(err as Error).message}`);
      res.status(404).json({ success: false, message: (err as Error).message });
    }
  }

  private async getAll(_: Request, res: Response): Promise<void> {
    try {
      const plants = await this.plantService.getAll();
      res.status(200).json({ success: true, data: plants });
    } catch (err) {
      await this.safeAudit(LogType.ERROR, `Greska pri dohvatanju biljaka: ${(err as Error).message}`);
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  private async search(req: Request, res: Response): Promise<void> {
    try {
      const q = req.params.q ?? "";
      const plants = await this.plantService.search(q);
      res.status(200).json({ success: true, data: plants });
    } catch (err) {
      await this.safeAudit(LogType.ERROR, `Pretraga biljaka neuspesna: ${(err as Error).message}`);
      res.status(400).json({ success: false, message: (err as Error).message });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}
