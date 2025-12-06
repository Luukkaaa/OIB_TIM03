import { CreatePerfumeDTO } from "../../Domain/DTOs/CreatePerfumeDTO";
import { UpdatePerfumeDTO } from "../../Domain/DTOs/UpdatePerfumeDTO";
import { PerfumeType } from "../../Domain/enums/PerfumeType";

const minLen = (val: string | undefined, n: number) => !!val && val.trim().length >= n;
const serialPattern = /^PP-2025-[A-Za-z0-9_-]+$/;

const isValidDate = (val: string | undefined) => {
  if (!val) return false;
  const d = new Date(val);
  return !Number.isNaN(d.getTime());
};

function validateBase(data: Partial<CreatePerfumeDTO | UpdatePerfumeDTO>): { success: boolean; message?: string } {
  if (data.name !== undefined && !minLen(data.name, 3)) {
    return { success: false, message: "Naziv parfema mora imati bar 3 karaktera" };
  }
  if (data.type !== undefined && !Object.values(PerfumeType).includes(data.type)) {
    return { success: false, message: "Nepoznat tip parfema" };
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
  if (!Object.values(PerfumeType).includes(data.type)) return { success: false, message: "Nepoznat tip parfema" };
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
