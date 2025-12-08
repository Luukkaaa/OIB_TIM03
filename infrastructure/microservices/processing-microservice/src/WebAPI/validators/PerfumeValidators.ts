import { CreatePerfumeDTO } from "../../Domain/DTOs/CreatePerfumeDTO";
import { UpdatePerfumeDTO } from "../../Domain/DTOs/UpdatePerfumeDTO";
import { PerfumeType } from "../../Domain/enums/PerfumeType";
import { ProcessRequestDTO } from "../../Domain/DTOs/ProcessRequestDTO";

const minLen = (val: string | undefined, n: number) => !!val && val.trim().length >= n;
const serialPattern = /^PP-2025-[A-Za-z0-9_-]+$/;

function normalizeType(val: any): PerfumeType | null {
  const t = (val ?? "").toString().trim().toUpperCase();
  if (t === PerfumeType.PARFEM || t === "ПАРФЕМ") return PerfumeType.PARFEM;
  if (
    t === PerfumeType.KOLONJSKA ||
    t === "KOLONJSKA VODA" ||
    t === "KOLONJSKA_VODA" ||
    t === "KOLONJSKA" ||
    t === "КОЛОЊСКА" ||
    t === "КОЛОЊСКА ВОДА"
  )
    return PerfumeType.KOLONJSKA;
  return null;
}

const isValidDate = (val: string | undefined) => {
  if (!val) return false;
  const d = new Date(val);
  return !Number.isNaN(d.getTime());
};

function validateBase(data: Partial<CreatePerfumeDTO | UpdatePerfumeDTO>): { success: boolean; message?: string } {
  if (data.name !== undefined && !minLen(data.name, 3)) {
    return { success: false, message: "Naziv parfema mora imati bar 3 karaktera" };
  }
  if (data.type !== undefined) {
    const norm = normalizeType(data.type);
    if (!norm) return { success: false, message: "Nepoznat tip parfema" };
    (data as any).type = norm;
  }
  if (data.netQuantityMl !== undefined && (Number.isNaN(data.netQuantityMl) || data.netQuantityMl <= 0)) {
    return { success: false, message: "Neto količina mora biti veća od 0" };
  }
  if (data.serialNumber !== undefined && !serialPattern.test(data.serialNumber)) {
    return { success: false, message: "Serijski broj mora biti formata PP-2025-<ID>" };
  }
  if (data.expirationDate !== undefined && !isValidDate(data.expirationDate)) {
    return { success: false, message: "Nevalidan datum isteka" };
  }
  if (data.plantId !== undefined && (Number.isNaN(data.plantId) || data.plantId <= 0)) {
    return { success: false, message: "Nevalidan plantId" };
  }
  return { success: true };
}

export function validateCreatePerfume(data: CreatePerfumeDTO): { success: boolean; message?: string } {
  if (!minLen(data.name, 3)) return { success: false, message: "Naziv parfema mora imati bar 3 karaktera" };
  const norm = normalizeType(data.type);
  if (!norm) return { success: false, message: "Nepoznat tip parfema" };
  (data as any).type = norm;
  if (Number.isNaN(data.netQuantityMl) || data.netQuantityMl <= 0) {
    return { success: false, message: "Neto količina mora biti veća od 0" };
  }
  if (!serialPattern.test(data.serialNumber)) {
    return { success: false, message: "Serijski broj mora biti formata PP-2025-<ID>" };
  }
  if (!isValidDate(data.expirationDate)) {
    return { success: false, message: "Nevalidan datum isteka" };
  }
  if (!data.plantId || data.plantId <= 0) {
    return { success: false, message: "Nevalidan plantId" };
  }
  return validateBase(data);
}

export function validateUpdatePerfume(data: UpdatePerfumeDTO): { success: boolean; message?: string } {
  if (!data || Object.keys(data).length === 0) {
    return { success: false, message: "Nema podataka za izmenu" };
  }
  return validateBase(data);
}

export function validateProcessRequest(data: ProcessRequestDTO): { success: boolean; message?: string } {
  if (!minLen(data.perfumeName, 3)) return { success: false, message: "Naziv parfema mora imati bar 3 karaktera" };
  const norm = normalizeType(data.perfumeType);
  if (!norm) return { success: false, message: "Nepoznat tip parfema" };
  (data as any).perfumeType = norm;
  if (Number.isNaN(data.bottleVolumeMl) || (data.bottleVolumeMl !== 150 && data.bottleVolumeMl !== 250)) {
    return { success: false, message: "Zapremina mora biti 150 ili 250 ml" };
  }
  if (Number.isNaN(data.bottleCount) || data.bottleCount <= 0) {
    return { success: false, message: "Broj bočica mora biti veći od 0" };
  }
  if (!data.plantId || data.plantId <= 0) return { success: false, message: "Nevalidan plantId" };
  if (!data.expirationDate || !isValidDate(data.expirationDate)) return { success: false, message: "Nevalidan datum isteka" };
  return { success: true };
}
