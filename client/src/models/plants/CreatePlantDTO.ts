import { PlantState } from "./PlantState";

export interface CreatePlantDTO {
  commonName: string;
  latinName: string;
  originCountry: string;
  oilStrength: number;
  state: PlantState;
}
