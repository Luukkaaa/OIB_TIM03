import { PlantState } from "../enums/PlantState";

export interface PlantSummaryDTO {
  from?: string;
  to?: string;
  totalSpecies: number;
  totalQuantity: number;
  averageOilStrength: number;
  byState: Array<{ state: PlantState; count: number; quantity: number }>;
}

export interface PlantSummaryFilter {
  from?: Date;
  to?: Date;
  state?: PlantState;
}
