import { PerfumeType } from "../enums/PerfumeType";

export interface PerfumeDTO {
  id: number;
  name: string;
  type: PerfumeType;
  netQuantityMl: number;
  serialNumber: string;
  expirationDate: string;
  plantId: number;
  createdAt: string;
  updatedAt: string;
}
