export interface PlantSummaryDTO {
  from?: string;
  to?: string;
  totalSpecies: number;
  totalQuantity: number;
  averageOilStrength: number;
  byState: Array<{ state: string; count: number; quantity: number }>;
}
