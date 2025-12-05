import { CreatePlantDTO } from "../../models/plants/CreatePlantDTO";
import { PlantDTO } from "../../models/plants/PlantDTO";
import { UpdatePlantDTO } from "../../models/plants/UpdatePlantDTO";

export interface IPlantAPI {
  getAllPlants(token: string): Promise<PlantDTO[]>;
  getPlantById(id: number, token: string): Promise<PlantDTO>;
  searchPlants(token: string, query: string): Promise<PlantDTO[]>;
  createPlant(token: string, plant: CreatePlantDTO): Promise<PlantDTO>;
  updatePlant(token: string, id: number, plant: UpdatePlantDTO): Promise<PlantDTO>;
  deletePlant(token: string, id: number): Promise<void>;
}
