import { PerfumeDTO } from "../../models/processing/PerfumeDTO";
import { PerfumeType } from "../../models/processing/PerfumeType";

export interface IProcessingAPI {
  getPerfumes(token: string): Promise<PerfumeDTO[]>;
  startProcessing(
    token: string,
    data: {
      perfumeName: string;
      perfumeType: PerfumeType;
      bottleVolumeMl: number;
      bottleCount: number;
      plantId: number;
      expirationDate: string;
      serialPrefix?: string;
    }
  ): Promise<PerfumeDTO[]>;
}
