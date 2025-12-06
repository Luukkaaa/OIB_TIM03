import { CreatePackagingDTO } from "../../Domain/DTOs/CreatePackagingDTO";
import { UpdatePackagingDTO } from "../../Domain/DTOs/UpdatePackagingDTO";
import { PackagingStatus } from "../../Domain/enums/PackagingStatus";

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
    return { success: false, message: "Adresa pošiljaoca mora imati bar 3 karakterа" };
  }
  if (data.warehouseId !== undefined && !isPositive(data.warehouseId)) {
    return { success: false, message: "warehouseId mora biti veći od 0" };
  }
  if (data.perfumeIds !== undefined && !arePerfumeIdsValid(data.perfumeIds)) {
    return { success: false, message: "Lista parfema mora sadržati bar један валидан ID" };
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
  if (!arePerfumeIdsValid(data.perfumeIds)) return { success: false, message: "Lista parfema mora sadržati bar један валидан ID" };
  if (data.status !== undefined && !Object.values(PackagingStatus).includes(data.status)) {
    return { success: false, message: "Nepozнат статус амбалаже" };
  }
  return validateBase(data);
}

export function validateUpdatePackaging(data: UpdatePackagingDTO): { success: boolean; message?: string } {
  if (!data || Object.keys(data).length === 0) {
    return { success: false, message: "Nema podataka за izmenu" };
  }
  return validateBase(data);
}
