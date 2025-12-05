import { PlantState } from "./PlantState";

export interface UpdatePlantDTO {
  commonName?: string;
  latinName?: string;
  originCountry?: string;
  oilStrength?: number;
  state?: PlantState;
}
