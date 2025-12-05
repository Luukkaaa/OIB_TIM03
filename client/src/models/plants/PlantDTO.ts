import { PlantState } from "./PlantState";

export interface PlantDTO {
  id: number;
  commonName: string;
  latinName: string;
  originCountry: string;
  oilStrength: number;
  state: PlantState;
  createdAt?: string;
  updatedAt?: string;
}
