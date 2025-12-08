import { CreatePlantDTO } from "../DTOs/CreatePlantDTO";
import { UpdatePlantDTO } from "../DTOs/UpdatePlantDTO";
import { Plant } from "../models/Plant";

export interface IPlantService {
  create(data: CreatePlantDTO): Promise<Plant>;
  update(id: number, data: UpdatePlantDTO): Promise<Plant>;
  delete(id: number): Promise<void>;
  getById(id: number): Promise<Plant>;
  getAll(): Promise<Plant[]>;
  search(query: string): Promise<Plant[]>;
  seedNew(commonName: string, latinName: string, originCountry: string, oilStrength?: number, quantity?: number): Promise<Plant>;
  adjustOilStrength(plantId: number, targetPercent: number): Promise<Plant>;
  harvest(commonName: string, count: number): Promise<Plant[]>;
}

