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
    const quantity = data.quantity !== undefined ? data.quantity : 1;

    const entity = this.repo.create({
      commonName: data.commonName.trim(),
      latinName: data.latinName.trim(),
      originCountry: data.originCountry.trim(),
      oilStrength: Number(data.oilStrength.toFixed(1)),
      quantity,
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

    if (data.commonName !== undefined) plant.commonName = data.commonName.trim();
    if (data.latinName !== undefined) plant.latinName = data.latinName.trim();
    if (data.originCountry !== undefined) plant.originCountry = data.originCountry.trim();
    if (data.quantity !== undefined) plant.quantity = data.quantity;
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
    // Agregiraj po commonName da bi se prikazala ukupna kolicina u jednom redu
    const aggregatedMap = new Map<string, Plant>();
    for (const plant of items) {
      const key = plant.commonName.trim().toLowerCase();
      const qty = plant.quantity ?? 1;
      if (!aggregatedMap.has(key)) {
        aggregatedMap.set(key, { ...plant, quantity: qty });
      } else {
        const existing = aggregatedMap.get(key)!;
        existing.quantity = (existing.quantity ?? 0) + qty;
        // Zadrži najskorije stanje po updatedAt ako postoji
        if (plant.updatedAt && existing.updatedAt && plant.updatedAt > existing.updatedAt) {
          existing.state = plant.state;
          existing.updatedAt = plant.updatedAt;
          existing.oilStrength = plant.oilStrength;
        }
      }
    }
    const aggregated = Array.from(aggregatedMap.values());
    await this.audit.log(LogType.INFO, `Dohvacene sve biljke (agregirano ${aggregated.length} vrsta)`);
    return aggregated;
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

  async seedNew(commonName: string, latinName: string, originCountry: string, oilStrength?: number, quantity: number = 1): Promise<Plant> {
    const strength = oilStrength !== undefined ? oilStrength : this.randomStrength();
    this.validateStrength(strength);
    if (quantity <= 0) throw new Error("Quantity must be positive");

    // Ako vec postoji zapis za ovu biljku, samo uvecaj quantity i postavi state na PLANTED
    const existing = await this.repo.findOne({ where: { commonName: commonName.trim() } });
    if (existing) {
      existing.quantity += quantity;
      existing.state = PlantState.PLANTED;
      const saved = await this.repo.save(existing);
      await this.audit.log(LogType.INFO, `Povecana kolicina biljke ${saved.commonName} za ${quantity} (ukupno ${saved.quantity})`);
      return saved;
    }

    const entity = this.repo.create({
      commonName: commonName.trim(),
      latinName: latinName.trim(),
      originCountry: originCountry.trim(),
      oilStrength: Number(strength.toFixed(1)),
      quantity,
      state: PlantState.PLANTED,
    });
    const saved = await this.repo.save(entity);
    await this.audit.log(LogType.INFO, `Zasadjena nova biljka ${saved.commonName} (ID: ${saved.id}, kolicina: ${saved.quantity})`);
    return saved;
  }

  async adjustOilStrength(plantId: number, targetPercent: number): Promise<Plant> {
    const plant = await this.repo.findOne({ where: { id: plantId } });
    if (!plant) {
      await this.audit.log(LogType.WARNING, `Podesavanje jacine neuspesno - biljka ID ${plantId} nije pronadjena`);
      throw new Error("Plant not found");
    }
    if (targetPercent <= 0) {
      await this.audit.log(LogType.WARNING, `Podesavanje jacine neuspesno - targetPercent <= 0 (uneto ${targetPercent})`);
      throw new Error("targetPercent must be greater than 0");
    }

    // Cilj: promena jačine za zadati procenat (npr. 65 => 65% trenutne vrednosti)
    const ratio = targetPercent / 100;
    const nextStrengthRaw = plant.oilStrength * ratio;
    const nextStrength = Math.max(1, Math.min(5, Number(nextStrengthRaw.toFixed(1))));
    plant.oilStrength = nextStrength;
    const saved = await this.repo.save(plant);
    await this.audit.log(LogType.INFO, `Podesena jacina ulja biljke ID ${plant.id} na ${nextStrength} (${targetPercent}% prethodne)`);
    return saved;
  }

  async harvest(commonName: string, count: number): Promise<Plant[]> {
    const plant = await this.repo.findOne({ where: { commonName: commonName.trim() } });
    if (!plant) {
      await this.audit.log(LogType.WARNING, `Berba neuspesna - biljka ${commonName} nije pronadjena`);
      throw new Error("Plant not found");
    }
    if (plant.quantity < count) {
      await this.audit.log(LogType.WARNING, `Nema dovoljno biljaka (${plant.quantity}/${count}) za vrstu ${commonName}`);
      throw new Error("Not enough plants to harvest");
    }

    plant.quantity -= count;
    // Ako smo sve ubrali, oznaci kao HARVESTED, inace ostaje PLANTED
    plant.state = plant.quantity > 0 ? PlantState.PLANTED : PlantState.HARVESTED;

    const saved = await this.repo.save(plant);
    await this.audit.log(LogType.INFO, `Ubrano ${count} biljaka vrste ${commonName} (preostalo ${saved.quantity})`);
    return [saved];
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

  private randomStrength(): number {
    const raw = 1 + Math.random() * 4; // 1.0 - 5.0
    return Number(raw.toFixed(1));
  }
}
