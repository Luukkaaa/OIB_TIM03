import { CreateWarehouseDTO } from "../../Domain/DTOs/CreateWarehouseDTO";
import { UpdateWarehouseDTO } from "../../Domain/DTOs/UpdateWarehouseDTO";

const minLen = (val: string | undefined, n: number) => !!val && val.trim().length >= n;
const isPositive = (val: number | undefined) => val !== undefined && !Number.isNaN(val) && val > 0;

const arePackagingIdsValid = (arr: number[] | undefined) => {
  if (!arr) return true; // optional
  return arr.every((id) => typeof id === "number" && !Number.isNaN(id) && id > 0);
};

function validateBase(data: Partial<CreateWarehouseDTO | UpdateWarehouseDTO>): { success: boolean; message?: string } {
  if (data.name !== undefined && !minLen(data.name, 3)) {
    return { success: false, message: "Naziv mora imati bar 3 karaktera" };
  }
  if (data.location !== undefined && !minLen(data.location, 3)) {
    return { success: false, message: "Lokacija mora imati bar 3 karaktera" };
  }
  if (data.capacity !== undefined && !isPositive(data.capacity)) {
    return { success: false, message: "Kapacitet mora biti veći od 0" };
  }
  if (data.packagingIds !== undefined && !arePackagingIdsValid(data.packagingIds)) {
    return { success: false, message: "Lista ambalaža sadrži nevalidan ID" };
  }
  return { success: true };
}

export function validateCreateWarehouse(data: CreateWarehouseDTO): { success: boolean; message?: string } {
  if (!minLen(data.name, 3)) return { success: false, message: "Naziv mora imati bar 3 karaktera" };
  if (!minLen(data.location, 3)) return { success: false, message: "Lokacija mora imati bar 3 karaktera" };
  if (!isPositive(data.capacity)) return { success: false, message: "Kapacitet mora biti veći od 0" };
  if (!validateBase(data).success) return validateBase(data);
  return { success: true };
}

export function validateUpdateWarehouse(data: UpdateWarehouseDTO): { success: boolean; message?: string } {
  if (!data || Object.keys(data).length === 0) {
    return { success: false, message: "Nema podataka za izmenu" };
  }
  return validateBase(data);
}
