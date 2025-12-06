export interface SeedPlantDTO {
  commonName: string;
  latinName: string;
  originCountry: string;
  quantity?: number;
  /**
   * Opcionalno: ako nije prosledjeno, generisace se nasumicno (1.0 - 5.0)
   */
  oilStrength?: number;
}
