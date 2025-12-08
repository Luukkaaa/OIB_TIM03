import { Request, Response, Router } from "express";
import { IPlantService } from "../../Domain/services/IPlantService";
import { validateCreatePlant, validateUpdatePlant, validateSeed, validateAdjust, validateHarvest } from "../validators/PlantValidators";
import { CreatePlantDTO } from "../../Domain/DTOs/CreatePlantDTO";
import { UpdatePlantDTO } from "../../Domain/DTOs/UpdatePlantDTO";
import { AuditLogClient } from "../../Services/AuditLogClient";
import { LogType } from "../../Services/LogType";
import { SeedPlantDTO } from "../../Domain/DTOs/SeedPlantDTO";
import { AdjustStrengthDTO } from "../../Domain/DTOs/AdjustStrengthDTO";
import { HarvestPlantsDTO } from "../../Domain/DTOs/HarvestPlantsDTO";

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

    // Production-specific operations
    this.router.post("/production/seed", this.seed.bind(this));
    this.router.post("/production/adjust-strength", this.adjustStrength.bind(this));
    this.router.post("/production/harvest", this.harvest.bind(this));
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

  private async seed(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body as SeedPlantDTO;
      const validation = validateSeed(data);
      if (!validation.success) {
        await this.safeAudit(LogType.WARNING, `Nevalidan zahtev za sadjenje biljke: ${validation.message}`);
        res.status(400).json({ success: false, message: validation.message });
        return;
      }
      const qty = data.quantity !== undefined ? data.quantity : 1;
      const created = await this.plantService.seedNew(data.commonName, data.latinName, data.originCountry, data.oilStrength, qty);
      res.status(201).json({ success: true, data: created });
    } catch (err) {
      await this.safeAudit(LogType.ERROR, `Sadjenje biljke neuspesno: ${(err as Error).message}`);
      res.status(400).json({ success: false, message: (err as Error).message });
    }
  }

  private async adjustStrength(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body as AdjustStrengthDTO;
      const validation = validateAdjust(data);
      if (!validation.success) {
        await this.safeAudit(LogType.WARNING, `Nevalidan zahtev za podesavanje jacine: ${validation.message}`);
        res.status(400).json({ success: false, message: validation.message });
        return;
      }
      const updated = await this.plantService.adjustOilStrength(data.plantId, data.targetPercent);
      res.status(200).json({ success: true, data: updated });
    } catch (err) {
      await this.safeAudit(LogType.ERROR, `Podesavanje jacine neuspesno: ${(err as Error).message}`);
      res.status(400).json({ success: false, message: (err as Error).message });
    }
  }

  private async harvest(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body as HarvestPlantsDTO;
      const validation = validateHarvest(data);
      if (!validation.success) {
        await this.safeAudit(LogType.WARNING, `Nevalidan zahtev za berbu: ${validation.message}`);
        res.status(400).json({ success: false, message: validation.message });
        return;
      }
      const harvested = await this.plantService.harvest(data.commonName, data.count);
      res.status(200).json({ success: true, data: harvested });
    } catch (err) {
      await this.safeAudit(LogType.ERROR, `Berba neuspesna: ${(err as Error).message}`);
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


