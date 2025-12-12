import { PerfumeDTO } from "../../models/processing/PerfumeDTO";
import { PerfumeType } from "../../models/processing/PerfumeType";
import { PerfumeSummary } from "../../models/reports/PerfumeSummary";

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
  getPerfumeSummary(token: string, params: { from?: string; to?: string; type?: string }): Promise<PerfumeSummary>;
  exportPerfumeSummary(
    token: string,
    params: { from?: string; to?: string; type?: string; format?: string }
  ): Promise<{ blob: Blob; filename: string; contentType: string }>;
}
