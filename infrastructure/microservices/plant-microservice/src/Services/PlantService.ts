import { Repository, Like } from "typeorm";
import { IPlantService } from "../Domain/services/IPlantService";
import { Plant } from "../Domain/models/Plant";
import { CreatePlantDTO } from "../Domain/DTOs/CreatePlantDTO";
import { UpdatePlantDTO } from "../Domain/DTOs/UpdatePlantDTO";
import { PlantState } from "../Domain/enums/PlantState";
import { AuditLogClient } from "./AuditLogClient";
import { LogType } from "./LogType";

export class PlantService implements IPlantService {
  constructor(private readonly repo: Repository<Plant>, private readonly audit: AuditLogClient) {}

  async create(data: CreatePlantDTO): Promise<Plant> {
    this.validateStrength(data.oilStrength);
    this.validateState(data.state);

    await this.ensureUniqueCommonName(data.commonName);
    await this.ensureUniqueLatin(data.latinName, data.originCountry);

    const entity = this.repo.create({
      commonName: data.commonName.trim(),
      latinName: data.latinName.trim(),
      originCountry: data.originCountry.trim(),
      oilStrength: Number(data.oilStrength.toFixed(1)),
      state: data.state,
    });

    const saved = await this.repo.save(entity);
    await this.audit.log(LogType.INFO, `Kreirana biljka ${saved.commonName} (${saved.latinName})`);
    return saved;
  }

  async update(id: number, data: UpdatePlantDTO): Promise<Plant> {
    const plant = await this.repo.findOne({ where: { id } });
    if (!plant) {
      await this.audit.log(LogType.WARNING, `Azuriranje neuspesno - biljka ID ${id} nije pronadjena`);
      throw new Error("Plant not found");
    }

    if (data.latinName || data.originCountry) {
      const nextLatin = data.latinName ?? plant.latinName;
      const nextOrigin = data.originCountry ?? plant.originCountry;
      await this.ensureUniqueLatin(nextLatin, nextOrigin, id);
    }
    if (data.commonName) {
      await this.ensureUniqueCommonName(data.commonName, id);
    }

    if (data.commonName !== undefined) plant.commonName = data.commonName.trim();
    if (data.latinName !== undefined) plant.latinName = data.latinName.trim();
    if (data.originCountry !== undefined) plant.originCountry = data.originCountry.trim();
    if (data.oilStrength !== undefined) {
      this.validateStrength(data.oilStrength);
      plant.oilStrength = Number(data.oilStrength.toFixed(1));
    }
    if (data.state !== undefined) {
      this.validateState(data.state);
      plant.state = data.state;
    }

    const saved = await this.repo.save(plant);
    await this.audit.log(LogType.INFO, `Azurirana biljka ${saved.commonName} (${saved.id})`);
    return saved;
  }

  async delete(id: number): Promise<void> {
    const result = await this.repo.delete({ id });
    if (!result.affected) {
      await this.audit.log(LogType.WARNING, `Brisanje neuspesno - biljka ID ${id} nije pronadjena`);
      throw new Error("Plant not found");
    }
    await this.audit.log(LogType.INFO, `Obrisana biljka ID ${id}`);
  }

  async getById(id: number): Promise<Plant> {
    const plant = await this.repo.findOne({ where: { id } });
    if (!plant) {
      await this.audit.log(LogType.WARNING, `Biljka ID ${id} nije pronadjena`);
      throw new Error("Plant not found");
    }
    await this.audit.log(LogType.INFO, `Dohvacena biljka ID ${id}`);
    return plant;
  }

  async getAll(): Promise<Plant[]> {
    const items = await this.repo.find({ order: { createdAt: "DESC" } });
    await this.audit.log(LogType.INFO, `Dohvacene sve biljke (${items.length})`);
    return items;
  }

  async search(query: string): Promise<Plant[]> {
    const q = query?.trim();
    if (!q || q.length < 2) {
      await this.audit.log(LogType.WARNING, "Nevalidan query za pretragu biljaka");
      throw new Error("Query must be at least 2 characters long");
    }
    const items = await this.repo.find({
      where: [{ commonName: Like(`%${q}%`) }, { latinName: Like(`%${q}%`) }],
      order: { createdAt: "DESC" },
    });
    await this.audit.log(LogType.INFO, `Pretraga biljaka '${q}' -> ${items.length} rezultata`);
    return items;
  }

  private validateStrength(val: number) {
    if (val === undefined || val === null || Number.isNaN(val) || val < 1 || val > 5) {
      throw new Error("Oil strength must be between 1.0 and 5.0");
    }
  }

  private validateState(state?: PlantState) {
    if (!state || !Object.values(PlantState).includes(state)) {
      throw new Error("Invalid plant state");
    }
  }

  private async ensureUniqueLatin(latin: string, origin: string, excludeId?: number): Promise<void> {
    const existing = await this.repo.findOne({
      where: { latinName: latin.trim(), originCountry: origin.trim() },
    });
    if (existing && existing.id !== excludeId) {
      throw new Error("Plant with given latin name and origin already exists");
    }
  }

  private async ensureUniqueCommonName(commonName: string, excludeId?: number): Promise<void> {
    const existing = await this.repo.findOne({
      where: { commonName: commonName.trim() },
    });
    if (existing && existing.id !== excludeId) {
      throw new Error("Plant with given common name already exists");
    }
  }
}
