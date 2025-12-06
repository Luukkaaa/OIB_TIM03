import { PerfumeType } from "../enums/PerfumeType";

export interface CreatePerfumeDTO {
  name: string;
  type: PerfumeType;
  netQuantityMl: number;
  serialNumber: string;
  plantId: number;
  expirationDate: string;
}
