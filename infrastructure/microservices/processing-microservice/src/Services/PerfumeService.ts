import { Repository, Like } from "typeorm";
import { IPerfumeService } from "../Domain/services/IPerfumeService";
import { Perfume } from "../Domain/models/Perfume";
import { CreatePerfumeDTO } from "../Domain/DTOs/CreatePerfumeDTO";
import { UpdatePerfumeDTO } from "../Domain/DTOs/UpdatePerfumeDTO";
import { AuditLogClient } from "./AuditLogClient";
import { LogType } from "./LogType";
import { PerfumeType } from "../Domain/enums/PerfumeType";
import { ProductionClient, PlantState } from "./ProductionClient";
import { ProcessRequestDTO } from "../Domain/DTOs/ProcessRequestDTO";

export class PerfumeService implements IPerfumeService {
  constructor(
    private readonly repo: Repository<Perfume>,
    private readonly audit: AuditLogClient,
    private readonly production: ProductionClient
  ) {}

  async create(data: CreatePerfumeDTO): Promise<Perfume> {
    await this.ensurePlantAvailability(data.plantId);
    await this.ensureUniqueSerial(data.serialNumber);
    this.validateType(data.type);

    const perfume = this.repo.create({
      name: data.name.trim(),
      type: data.type,
      netQuantityMl: data.netQuantityMl,
      serialNumber: data.serialNumber.trim(),
      expirationDate: new Date(data.expirationDate),
      plantId: data.plantId,
    });
    const saved = await this.repo.save(perfume);
    await this.audit.log(LogType.INFO, `Kreiran parfem ${saved.name} (${saved.serialNumber})`);
    return saved;
  }

  async update(id: number, data: UpdatePerfumeDTO): Promise<Perfume> {
    const perfume = await this.repo.findOne({ where: { id } });
    if (!perfume) {
      await this.audit.log(LogType.WARNING, `Parfem ${id} nije pronadjen za azuriranje`);
      throw new Error("Perfume not found");
    }

    if (data.serialNumber && data.serialNumber.trim() !== perfume.serialNumber) {
      await this.ensureUniqueSerial(data.serialNumber, id);
    }
    if (data.plantId && data.plantId !== perfume.plantId) {
      perfume.plantId = data.plantId;
    }
    if (data.type !== undefined) {
      this.validateType(data.type);
      perfume.type = data.type;
    }
    if (data.name !== undefined) perfume.name = data.name.trim();
    if (data.netQuantityMl !== undefined) perfume.netQuantityMl = data.netQuantityMl;
    if (data.serialNumber !== undefined) perfume.serialNumber = data.serialNumber.trim();
    if (data.expirationDate !== undefined) perfume.expirationDate = new Date(data.expirationDate);

    const saved = await this.repo.save(perfume);
    await this.audit.log(LogType.INFO, `Azuriran parfem ${saved.name} (${saved.id})`);
    return saved;
  }

  async delete(id: number): Promise<void> {
    const result = await this.repo.delete({ id });
    if (!result.affected) {
      await this.audit.log(LogType.WARNING, `Parfem ${id} nije pronadjen za brisanje`);
      throw new Error("Perfume not found");
    }
    await this.audit.log(LogType.INFO, `Obrisan parfem ID ${id}`);
  }

  async getById(id: number): Promise<Perfume> {
    const perfume = await this.repo.findOne({ where: { id } });
    if (!perfume) {
      await this.audit.log(LogType.WARNING, `Parfem ${id} nije pronadjen`);
      throw new Error("Perfume not found");
    }
    await this.audit.log(LogType.INFO, `Dohvacen parfem ${id}`);
    return perfume;
  }

  async getAll(): Promise<Perfume[]> {
    const items = await this.repo.find({ order: { createdAt: "DESC" } });
    await this.audit.log(LogType.INFO, `Dohvaceni svi parfemi (${items.length})`);
    return items;
  }

  async search(query: string): Promise<Perfume[]> {
    const q = query?.trim();
    if (!q || q.length < 2) {
      await this.audit.log(LogType.WARNING, "Nevalidan query za pretragu parfema");
      throw new Error("Query must be at least 2 characters long");
    }
    const items = await this.repo.find({
      where: [{ name: Like(`%${q}%`) }, { serialNumber: Like(`%${q}%`) }],
      order: { createdAt: "DESC" },
    });
    await this.audit.log(LogType.INFO, `Pretraga parfema '${q}' -> ${items.length} rezultata`);
    return items;
  }

  private async ensureUniqueSerial(serial: string, excludeId?: number) {
    const existing = await this.repo.findOne({ where: { serialNumber: serial.trim() } });
    if (existing && existing.id !== excludeId) {
      throw new Error("Parfem sa datim serijskim brojem vec postoji");
    }
  }

  private validateType(type: PerfumeType) {
    if (!Object.values(PerfumeType).includes(type)) {
      throw new Error("Nepoznat tip parfema");
    }
  }

  /**
   * Pokrece preradu: racuna potrebne biljke, zahteva berbu/sadnju, kreira bocice parfema.
   * Formula: jedna biljka daje 50 ml parfema.
   */
  async process(req: ProcessRequestDTO): Promise<Perfume[]> {
    const neededPlants = Math.ceil((req.bottleCount * req.bottleVolumeMl) / 50);
    const plant = await this.production.getPlantById(req.plantId);
    if (!plant || !plant.commonName) throw new Error("Plant not found");

    // osiguraj dostupnost biljaka; ako nema dovoljno quantity, probaj da zasadi pa da beres
    if (!plant.quantity || plant.quantity < neededPlants) {
      const deficit = neededPlants - (plant.quantity ?? 0);
      await this.production.seedPlant({
        commonName: plant.commonName,
        latinName: plant.latinName,
        originCountry: plant.originCountry,
        quantity: deficit,
      });
      await this.audit.log(LogType.INFO, `Automatski zasadjeno ${deficit} biljaka (${plant.commonName}) za preradu`);
    }

    // berba potrebnog broja biljaka
    await this.production.harvest(plant.commonName, neededPlants);

    // kreiranje parfema sa serijskim brojem
    const prefix = req.serialPrefix ?? "PP-2025";
    const createdPerfumes: Perfume[] = [];
    const baseName = req.perfumeName.trim();
    for (let i = 0; i < req.bottleCount; i++) {
      const serialNumber = `${prefix}-${Date.now()}-${i + 1}`;
      await this.ensureUniqueSerial(serialNumber);
      const perfume = this.repo.create({
        name: baseName,
        type: req.perfumeType,
        netQuantityMl: req.bottleVolumeMl,
        serialNumber,
        expirationDate: new Date(req.expirationDate),
        plantId: req.plantId,
      });
      createdPerfumes.push(await this.repo.save(perfume));
    }

    await this.audit.log(
      LogType.INFO,
      `Prerada zavrsena: ${req.bottleCount} bocica (${req.perfumeName}), potreba biljaka: ${neededPlants}`
    );
    return createdPerfumes;
  }

  /**
   * Proverava stanje biljke; ako je nema ili je kolicina 0, trazi sadnju nove.
   * Ako je jacina > 4.0, sadi novu biljku i smanjuje je na balansiranu vrednost (≈65% trenutne).
   */
  private async ensurePlantAvailability(plantId: number): Promise<void> {
    try {
      const plant = await this.production.getPlantById(plantId);

      // Ako nema kolicine ili nije posadena, posadi novu
      if (!plant || plant.quantity === undefined || plant.quantity <= 0 || plant.state !== PlantState.PLANTED) {
        await this.production.seedPlant({
          commonName: plant?.commonName ?? `Auto-plant-${Date.now()}`,
          latinName: plant?.latinName ?? "Auto gen",
          originCountry: plant?.originCountry ?? "N/A",
        });
        await this.audit.log(LogType.INFO, `Automatski zasadjena biljka jer nije dostupna (plantId ${plantId})`);
        return;
      }

      // Ako je jacina presla 4.0, zasadi novu i smanji direktno na balansiranu vrednost
      if (plant.oilStrength > 4) {
        const targetStrength = Math.max(1, Math.min(5, Number((plant.oilStrength * 0.65).toFixed(1))));
        const seeded = await this.production.seedPlant({
          commonName: plant.commonName,
          latinName: plant.latinName,
          originCountry: plant.originCountry,
        });
        await this.production.adjustStrength(seeded.id, targetStrength);
        await this.audit.log(
          LogType.INFO,
          `Detektovana jacina ${plant.oilStrength} (>4). Zasadjena nova biljka ${seeded.commonName} i smanjena na ${targetStrength}`
        );
      }
    } catch (err: any) {
      await this.audit.log(LogType.WARNING, `ensurePlantAvailability neuspeh: ${err?.message || "Nepoznata greska"}`);
    }
  }
}
