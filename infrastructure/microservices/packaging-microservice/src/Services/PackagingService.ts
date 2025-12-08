import { Repository, Like } from "typeorm";
import { IPackagingService } from "../Domain/services/IPackagingService";
import { Packaging } from "../Domain/models/Packaging";
import { CreatePackagingDTO } from "../Domain/DTOs/CreatePackagingDTO";
import { UpdatePackagingDTO } from "../Domain/DTOs/UpdatePackagingDTO";
import { AuditLogClient } from "./AuditLogClient";
import { LogType } from "./LogType";
import { PackagingStatus } from "../Domain/enums/PackagingStatus";
import { PackRequestDTO } from "../Domain/DTOs/PackRequestDTO";
import { SendRequestDTO } from "../Domain/DTOs/SendRequestDTO";
import { ProcessingClient, PerfumeType } from "./ProcessingClient";

export class PackagingService implements IPackagingService {
  constructor(
    private readonly repo: Repository<Packaging>,
    private readonly audit: AuditLogClient,
    private readonly processing: ProcessingClient
  ) {}

  async create(data: CreatePackagingDTO): Promise<Packaging> {
    this.validateStatus(data.status);

    const entity = this.repo.create({
      name: data.name.trim(),
      senderAddress: data.senderAddress.trim(),
      warehouseId: data.warehouseId,
      perfumeIds: data.perfumeIds,
      status: data.status ?? PackagingStatus.SPAKOVANA,
    });
    const saved = await this.repo.save(entity);
    await this.audit.log(LogType.INFO, `Kreirana ambalaza ${saved.name} (ID ${saved.id})`);
    return saved;
  }

  async update(id: number, data: UpdatePackagingDTO): Promise<Packaging> {
    const packaging = await this.repo.findOne({ where: { id } });
    if (!packaging) {
      await this.audit.log(LogType.WARNING, `Ambalaza ${id} nije pronadjena`);
      throw new Error("Packaging not found");
    }

    if (data.status !== undefined) this.validateStatus(data.status);
    if (data.name !== undefined) packaging.name = data.name.trim();
    if (data.senderAddress !== undefined) packaging.senderAddress = data.senderAddress.trim();
    if (data.warehouseId !== undefined) packaging.warehouseId = data.warehouseId;
    if (data.perfumeIds !== undefined) packaging.perfumeIds = data.perfumeIds;
    if (data.status !== undefined) packaging.status = data.status;

    const saved = await this.repo.save(packaging);
    await this.audit.log(LogType.INFO, `Azurirana ambalaza ID ${saved.id}`);
    return saved;
  }

  async delete(id: number): Promise<void> {
    const result = await this.repo.delete({ id });
    if (!result.affected) {
      await this.audit.log(LogType.WARNING, `Ambalaza ${id} nije pronadjena za brisanje`);
      throw new Error("Packaging not found");
    }
    await this.audit.log(LogType.INFO, `Obrisana ambalaza ID ${id}`);
  }

  async getById(id: number): Promise<Packaging> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) {
      await this.audit.log(LogType.WARNING, `Ambalaza ${id} nije pronadjena`);
      throw new Error("Packaging not found");
    }
    await this.audit.log(LogType.INFO, `Dohvacena ambalaza ID ${id}`);
    return item;
  }

  async getAll(): Promise<Packaging[]> {
    const items = await this.repo.find({ order: { createdAt: "DESC" } });
    await this.audit.log(LogType.INFO, `Dohvacene sve ambalaze (${items.length})`);
    return items;
  }

  async search(query: string): Promise<Packaging[]> {
    const q = query?.trim();
    if (!q || q.length < 2) {
      await this.audit.log(LogType.WARNING, "Nevalidan query za pretragu ambalaza");
      throw new Error("Query must be at least 2 characters long");
    }
    const items = await this.repo.find({
      where: [{ name: Like(`%${q}%`) }, { senderAddress: Like(`%${q}%`) }],
      order: { createdAt: "DESC" },
    });
    await this.audit.log(LogType.INFO, `Pretraga ambalaza '${q}' -> ${items.length} rezultata`);
    return items;
  }

  private validateStatus(status?: PackagingStatus) {
    if (status && !Object.values(PackagingStatus).includes(status)) {
      throw new Error("Nepoznat status ambalaze");
    }
  }

  /**
   * Pakuje parfeme: jedan parfem po ambalaži.
   */
  async pack(req: PackRequestDTO): Promise<Packaging[]> {
    let perfumeIds: number[] = [];

    if (req.perfumeIds && req.perfumeIds.length > 0) {
      perfumeIds = req.perfumeIds;
    } else {
      // Trazi parfeme iz processing servisa (tip/kol/zapremina)
      if (
        !req.perfumeName ||
        !req.perfumeType ||
        !req.bottleVolumeMl ||
        !req.bottleCount ||
        !req.plantId ||
        !req.expirationDate
      ) {
        throw new Error("Nedostaju podaci za kreiranje parfema (perfumeType, bottleVolumeMl, bottleCount, plantId, expirationDate)");
      }

      const perfumes = await this.processing.startProcessing({
        perfumeName: req.perfumeName,
        perfumeType: req.perfumeType as PerfumeType,
        bottleVolumeMl: req.bottleVolumeMl,
        bottleCount: req.bottleCount,
        plantId: req.plantId,
        expirationDate: req.expirationDate,
      });
      perfumeIds = perfumes.map((p) => p.id);
    }

    const packages: Packaging[] = [];
    const prefix = req.namePrefix ?? "Ambalaža";
    let idx = 1;
    for (const pid of perfumeIds) {
      const entity = this.repo.create({
        name: `${prefix}-${idx}`,
        senderAddress: req.senderAddress.trim(),
        warehouseId: req.warehouseId,
        perfumeIds: [pid],
        status: PackagingStatus.SPAKOVANA,
      });
      const saved = await this.repo.save(entity);
      packages.push(saved);
      idx++;
    }
    await this.audit.log(LogType.INFO, `Spakovano ${packages.length} ambalaza (1 parfem po ambalazi)`);
    return packages;
  }

  /**
   * Oznacava postojecu ambalazu kao poslatu u odabrano skladiste.
   * Ako nema dostupne (SPAKOVANA), pokreće fallback pakovanje (processing -> pack) za jedan set parfema.
   */
  async send(req: SendRequestDTO): Promise<Packaging> {
    let packaging: Packaging | null = null;

    // Ako je prosledjen konkretan ID, uzmi njega; inace prva dostupna SPAKOVANA
    if (req.packagingId) {
      packaging = await this.repo.findOne({ where: { id: req.packagingId, status: PackagingStatus.SPAKOVANA } });
    } else {
      packaging = await this.repo.findOne({ where: { status: PackagingStatus.SPAKOVANA }, order: { createdAt: "ASC" } });
    }

    // Ako nema dostupne, pokreni fallback pakovanje
    if (!packaging) {
      // Fallback koristi iste parametre kao PackRequestDTO (perfumeIds ili procesiranje)
      if (
        !(req.perfumeIds && req.perfumeIds.length > 0) &&
        !(
          req.perfumeName &&
          req.perfumeType &&
          req.bottleVolumeMl &&
          req.bottleCount &&
          req.plantId &&
          req.expirationDate &&
          req.senderAddress
        )
      ) {
        await this.audit.log(LogType.WARNING, "Nema dostupne ambalaze za slanje, a fallback podaci nisu prosledjeni");
        throw new Error("Nema dostupne ambalaze i nema podataka za novo pakovanje");
      }

      const packed = await this.pack({
        perfumeIds: req.perfumeIds,
        perfumeName: req.perfumeName,
        perfumeType: req.perfumeType as PerfumeType,
        bottleVolumeMl: req.bottleVolumeMl,
        bottleCount: req.bottleCount,
        plantId: req.plantId,
        expirationDate: req.expirationDate,
        warehouseId: req.warehouseId,
        senderAddress: req.senderAddress || "Auto sender",
        namePrefix: req.namePrefix,
      });
      packaging = packed[0];
    }

    packaging.warehouseId = req.warehouseId;
    packaging.status = PackagingStatus.POSLATA;
    const saved = await this.repo.save(packaging);
    await this.audit.log(LogType.INFO, `Ambalaza ${saved.id} poslata u skladiste ${req.warehouseId}`);
    return saved;
  }
}
