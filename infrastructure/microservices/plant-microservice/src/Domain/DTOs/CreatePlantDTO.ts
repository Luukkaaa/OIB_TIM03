import { PlantState } from "../enums/PlantState";

export interface CreatePlantDTO {
  commonName: string;
  latinName: string;
  originCountry: string;
  oilStrength: number;
  state: PlantState;
}
