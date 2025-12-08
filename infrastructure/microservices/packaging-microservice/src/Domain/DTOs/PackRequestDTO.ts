export interface PackRequestDTO {
  // Ako se proslede ID-jevi, direktno se pakuju (1 parfem po ambalaži)
  perfumeIds?: number[];

  // Ako nema perfumeIds, može se tražiti prerada u processing servisu
  perfumeName?: string;
  perfumeType?: string; // npr. PARFEM | KOLONJSKA_VODA
  bottleVolumeMl?: number; // 150 | 250
  bottleCount?: number;
  plantId?: number;
  expirationDate?: string; // ISO

  warehouseId: number;
  senderAddress: string;
  namePrefix?: string; // opcioni prefiks za naziv ambalaže
}
