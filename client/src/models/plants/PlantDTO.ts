import { PlantState } from "./PlantState";

export interface PlantDTO {
  id: number;
  commonName: string;
  latinName: string;
  originCountry: string;
  oilStrength: number;
  quantity?: number;
  state: PlantState;
  createdAt?: string;
  updatedAt?: string;
}
