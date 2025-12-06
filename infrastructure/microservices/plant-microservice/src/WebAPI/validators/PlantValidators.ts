import { CreatePlantDTO } from "../../Domain/DTOs/CreatePlantDTO";
import { UpdatePlantDTO } from "../../Domain/DTOs/UpdatePlantDTO";
import { PlantState } from "../../Domain/enums/PlantState";
import { SeedPlantDTO } from "../../Domain/DTOs/SeedPlantDTO";
import { AdjustStrengthDTO } from "../../Domain/DTOs/AdjustStrengthDTO";
import { HarvestPlantsDTO } from "../../Domain/DTOs/HarvestPlantsDTO";

const minLen = (val: string, n: number) => !!val && val.trim().length >= n;

const isStrengthValid = (val: number | undefined): boolean => {
  if (val === undefined || val === null) return false;
  return !Number.isNaN(val) && val >= 1 && val <= 5;
};

const isQuantityPositive = (val: number | undefined): boolean => {
  if (val === undefined || val === null) return true; // optional
  return Number.isInteger(val) && val >= 1 && val <= 100000;
};

const isQuantityNonNegative = (val: number | undefined): boolean => {
  if (val === undefined || val === null) return true;
  return Number.isInteger(val) && val >= 0 && val <= 100000;
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
  if (!isQuantityPositive(data.quantity)) {
    return { success: false, message: "Quantity must be a positive integer" };
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
  if (!isQuantityNonNegative(data.quantity)) {
    return { success: false, message: "Quantity must be a non-negative integer" };
  }
  if (data.state !== undefined && !Object.values(PlantState).includes(data.state)) {
    return { success: false, message: "Invalid plant state" };
  }

  return { success: true };
}

export function validateSeed(data: SeedPlantDTO): { success: boolean; message?: string } {
  if (!minLen(data.commonName, 3)) return { success: false, message: "Common name must have at least 3 characters" };
  if (!minLen(data.latinName, 3)) return { success: false, message: "Latin name must have at least 3 characters" };
  if (!minLen(data.originCountry, 2)) return { success: false, message: "Origin country must have at least 2 characters" };
  if (data.oilStrength !== undefined && !isStrengthValid(data.oilStrength)) {
    return { success: false, message: "Oil strength must be between 1.0 and 5.0" };
  }
  if (!isQuantityPositive(data.quantity)) {
    return { success: false, message: "Quantity must be a positive integer" };
  }
  return { success: true };
}

export function validateAdjust(data: AdjustStrengthDTO): { success: boolean; message?: string } {
  if (!data || !data.plantId || Number.isNaN(data.plantId)) return { success: false, message: "plantId is required" };
  if (!data.targetPercent || Number.isNaN(data.targetPercent)) return { success: false, message: "targetPercent is required" };
  if (data.targetPercent <= 0) return { success: false, message: "targetPercent must be greater than 0" };
  if (data.targetPercent > 500) return { success: false, message: "targetPercent must be <= 500" };
  return { success: true };
}

export function validateHarvest(data: HarvestPlantsDTO): { success: boolean; message?: string } {
  if (!minLen(data.commonName, 2)) return { success: false, message: "Common name must have at least 2 characters" };
  if (!data.count || Number.isNaN(data.count)) return { success: false, message: "count is required" };
  if (data.count <= 0) return { success: false, message: "count must be greater than 0" };
  if (data.count > 1000) return { success: false, message: "count too large" };
  return { success: true };
}
