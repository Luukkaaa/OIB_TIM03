import { CreatePlantDTO } from "../../models/plants/CreatePlantDTO";
import { PlantDTO } from "../../models/plants/PlantDTO";
import { UpdatePlantDTO } from "../../models/plants/UpdatePlantDTO";
import { PlantSummary } from "../../models/reports/PlantSummary";

export interface IPlantAPI {
  getAllPlants(token: string): Promise<PlantDTO[]>;
  getPlantById(id: number, token: string): Promise<PlantDTO>;
  searchPlants(token: string, query: string): Promise<PlantDTO[]>;
  createPlant(token: string, plant: CreatePlantDTO): Promise<PlantDTO>;
  updatePlant(token: string, id: number, plant: UpdatePlantDTO): Promise<PlantDTO>;
  deletePlant(token: string, id: number): Promise<void>;
  seedPlant(token: string, data: { commonName: string; latinName: string; originCountry: string; oilStrength?: number; quantity?: number }): Promise<PlantDTO>;
  adjustStrength(token: string, data: { plantId: number; targetPercent: number }): Promise<PlantDTO>;
  harvestPlants(token: string, data: { commonName: string; count: number }): Promise<PlantDTO[]>;
  getPlantSummary(token: string, params: { from?: string; to?: string; state?: string }): Promise<PlantSummary>;
  exportPlantSummary(
    token: string,
    params: { from?: string; to?: string; state?: string; format?: string }
  ): Promise<{ blob: Blob; filename: string; contentType: string }>;
}
