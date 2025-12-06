import { PerfumeType } from "../enums/PerfumeType";

export interface UpdatePerfumeDTO {
  name?: string;
  type?: PerfumeType;
  netQuantityMl?: number;
  serialNumber?: string;
  plantId?: number;
  expirationDate?: string; // ISO date string
}
