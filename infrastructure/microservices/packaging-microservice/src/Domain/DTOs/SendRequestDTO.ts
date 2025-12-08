import { PackRequestDTO } from "./PackRequestDTO";

export interface SendRequestDTO {
  warehouseId: number;
  // opcionalno: prosledi konkretan packagingId; ako nije prosledjen, uzima se prva dostupna (SPAKOVANA)
  packagingId?: number;

  // fallback: ako nema dostupne ambalaže, pokreni pakovanje (isti format kao PackRequestDTO, bez warehouseId/senderAddress kojih već ima u ovom DTO)
  perfumeIds?: number[];
  perfumeName?: string;
  perfumeType?: string;
  bottleVolumeMl?: number;
  bottleCount?: number;
  plantId?: number;
  expirationDate?: string;
  senderAddress?: string;
  namePrefix?: string;
}
