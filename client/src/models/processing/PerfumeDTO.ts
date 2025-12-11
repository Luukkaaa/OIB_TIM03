import { PerfumeType } from "./PerfumeType";

export interface PerfumeDTO {
  id: number;
  name: string;
  type: PerfumeType | string;
  netQuantityMl: number;
  serialNumber: string;
  expirationDate: string;
  plantId: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}
