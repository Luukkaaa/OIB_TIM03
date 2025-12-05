import { CreatePlantDTO } from "../../Domain/DTOs/CreatePlantDTO";
import { UpdatePlantDTO } from "../../Domain/DTOs/UpdatePlantDTO";
import { PlantState } from "../../Domain/enums/PlantState";

const minLen = (val: string, n: number) => !!val && val.trim().length >= n;

const isStrengthValid = (val: number | undefined): boolean => {
  if (val === undefined || val === null) return false;
  return !Number.isNaN(val) && val >= 1 && val <= 5;
};

export function validateCreatePlant(data: CreatePlantDTO): { success: boolean; message?: string } {
  if (!minLen(data.commonName, 3)) {
    return { success: false, message: "Common name must have at least 3 characters" };
  }
  if (!minLen(data.latinName, 3)) {
    return { success: false, message: "Latin name must have at least 3 characters" };
  }
  if (!minLen(data.originCountry, 2)) {
    return { success: false, message: "Origin country must have at least 2 characters" };
  }
  if (!isStrengthValid(data.oilStrength)) {
    return { success: false, message: "Oil strength must be between 1.0 and 5.0" };
  }
  if (!data.state || !Object.values(PlantState).includes(data.state)) {
    return { success: false, message: "Invalid plant state" };
  }
  return { success: true };
}

export function validateUpdatePlant(data: UpdatePlantDTO): { success: boolean; message?: string } {
  if (!data || Object.keys(data).length === 0) {
    return { success: false, message: "No data provided for update" };
  }

  if (data.commonName !== undefined && !minLen(data.commonName, 3)) {
    return { success: false, message: "Common name must have at least 3 characters" };
  }
  if (data.latinName !== undefined && !minLen(data.latinName, 3)) {
    return { success: false, message: "Latin name must have at least 3 characters" };
  }
  if (data.originCountry !== undefined && !minLen(data.originCountry, 2)) {
    return { success: false, message: "Origin country must have at least 2 characters" };
  }
  if (data.oilStrength !== undefined && !isStrengthValid(data.oilStrength)) {
    return { success: false, message: "Oil strength must be between 1.0 and 5.0" };
  }
  if (data.state !== undefined && !Object.values(PlantState).includes(data.state)) {
    return { success: false, message: "Invalid plant state" };
  }

  return { success: true };
}
