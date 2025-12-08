import { CreatePackagingDTO } from "../../Domain/DTOs/CreatePackagingDTO";
import { UpdatePackagingDTO } from "../../Domain/DTOs/UpdatePackagingDTO";
import { PackagingStatus } from "../../Domain/enums/PackagingStatus";
import { PackRequestDTO } from "../../Domain/DTOs/PackRequestDTO";
import { SendRequestDTO } from "../../Domain/DTOs/SendRequestDTO";

const minLen = (val: string | undefined, n: number) => !!val && val.trim().length >= n;
const isPositive = (val: number | undefined) => val !== undefined && !Number.isNaN(val) && val > 0;

const arePerfumeIdsValid = (arr: number[] | undefined) => {
  if (!arr || arr.length === 0) return false;
  return arr.every((id) => typeof id === "number" && !Number.isNaN(id) && id > 0);
};

function validateBase(data: Partial<CreatePackagingDTO | UpdatePackagingDTO>): { success: boolean; message?: string } {
  if (data.name !== undefined && !minLen(data.name, 3)) {
    return { success: false, message: "Naziv mora imati bar 3 karaktera" };
  }
  if (data.senderAddress !== undefined && !minLen(data.senderAddress, 3)) {
    return { success: false, message: "Adresa pošiljaoca mora imati bar 3 karaktera" };
  }
  if (data.warehouseId !== undefined && !isPositive(data.warehouseId)) {
    return { success: false, message: "warehouseId mora biti veći od 0" };
  }
  if (data.perfumeIds !== undefined && !arePerfumeIdsValid(data.perfumeIds)) {
    return { success: false, message: "Lista parfema mora imati bar jedan ID" };
  }
  if (data.status !== undefined && !Object.values(PackagingStatus).includes(data.status)) {
    return { success: false, message: "Nepoznat status ambalaže" };
  }
  return { success: true };
}

export function validateCreatePackaging(data: CreatePackagingDTO): { success: boolean; message?: string } {
  if (!minLen(data.name, 3)) return { success: false, message: "Naziv mora imati bar 3 karaktera" };
  if (!minLen(data.senderAddress, 3)) return { success: false, message: "Adresa pošiljaoca mora imati bar 3 karaktera" };
  if (!isPositive(data.warehouseId)) return { success: false, message: "warehouseId mora biti veći od 0" };
  if (!arePerfumeIdsValid(data.perfumeIds)) return { success: false, message: "Lista parfema mora imati bar jedan ID" };
  if (data.status !== undefined && !Object.values(PackagingStatus).includes(data.status)) {
    return { success: false, message: "Nepoznat status ambalaže" };
  }
  return validateBase(data);
}

export function validateUpdatePackaging(data: UpdatePackagingDTO): { success: boolean; message?: string } {
  if (!data || Object.keys(data).length === 0) {
    return { success: false, message: "Nema podataka za izmenu" };
  }
  return validateBase(data);
}

export function validatePackRequest(data: PackRequestDTO): { success: boolean; message?: string } {
  const hasIds = arePerfumeIdsValid(data.perfumeIds);
  const hasProcess =
    !!data.perfumeType &&
    !!data.perfumeName &&
    isPositive(data.bottleCount) &&
    (data.bottleVolumeMl === 150 || data.bottleVolumeMl === 250) &&
    isPositive(data.plantId) &&
    !!data.expirationDate;

  if (!hasIds && !hasProcess) {
    return { success: false, message: "Prosledi parfeme (perfumeIds) ili podatke za preradu" };
  }
  if (!isPositive(data.warehouseId)) return { success: false, message: "warehouseId mora biti veći od 0" };
  if (!minLen(data.senderAddress, 3)) return { success: false, message: "Adresa pošiljaoca mora imati bar 3 karaktera" };
  return { success: true };
}

export function validateSendRequest(data: SendRequestDTO): { success: boolean; message?: string } {
  if (!isPositive(data.warehouseId)) return { success: false, message: "Nevalidan warehouseId" };
  if (data.packagingId !== undefined && !isPositive(data.packagingId)) {
    return { success: false, message: "Nevalidan packagingId" };
  }
  const hasFallbackIds = arePerfumeIdsValid(data.perfumeIds);
  const hasFallbackProcess =
    !!data.perfumeType &&
    !!data.perfumeName &&
    isPositive(data.bottleCount) &&
    (data.bottleVolumeMl === 150 || data.bottleVolumeMl === 250) &&
    isPositive(data.plantId) &&
    !!data.expirationDate &&
    !!data.senderAddress;

  // Ako nema dostupne ambalaže, tražićemo fallback; ovde samo proveravamo da li su podaci validni ako su prosleđeni
  if (data.perfumeIds || data.perfumeName || data.perfumeType || data.bottleVolumeMl || data.bottleCount || data.plantId || data.expirationDate) {
    if (!(hasFallbackIds || hasFallbackProcess)) {
      return { success: false, message: "Nepotpuni podaci za fallback pakovanje" };
    }
  }

  return { success: true };
}
