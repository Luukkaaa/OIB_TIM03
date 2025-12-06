export interface AdjustStrengthDTO {
  plantId: number;
  /**
   * Novi procenat trenutne jačine (npr. 65 znači postavi na 65% trenutne vrednosti).
   */
  targetPercent: number;
}

