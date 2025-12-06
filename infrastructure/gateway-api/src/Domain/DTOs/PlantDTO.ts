export interface PlantDTO {
  id: number;
  commonName: string;
  latinName: string;
  originCountry: string;
  oilStrength: number;
  quantity?: number;
  state: string;
  createdAt?: string;
  updatedAt?: string;
}
