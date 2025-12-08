import { PerfumeType } from "../enums/PerfumeType";

export interface ProcessRequestDTO {
  perfumeName: string;
  perfumeType: PerfumeType;
  bottleVolumeMl: number; // 150 ili 250
  bottleCount: number; // broj bočica
  plantId: number;
  expirationDate: string; // ISO
  serialPrefix?: string; // PP-2025-
}
