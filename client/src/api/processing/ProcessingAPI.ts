import axios, { AxiosInstance, AxiosResponse } from "axios";
import { IProcessingAPI } from "./IProcessingAPI";
import { PerfumeDTO } from "../../models/processing/PerfumeDTO";
import { PerfumeType } from "../../models/processing/PerfumeType";

export class ProcessingAPI implements IProcessingAPI {
  private readonly axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: import.meta.env.VITE_GATEWAY_URL,
      headers: { "Content-Type": "application/json" },
    });
  }

  private getAuthHeaders(token: string) {
    return { Authorization: `Bearer ${token}` };
  }

  async getPerfumes(token: string): Promise<PerfumeDTO[]> {
    const response: AxiosResponse<{ success?: boolean; data: PerfumeDTO[] } | PerfumeDTO[]> = await this.axiosInstance.get("/perfumes", {
      headers: this.getAuthHeaders(token),
    });
    const payload = (response.data as any).data ?? response.data;
    return payload as PerfumeDTO[];
  }

  async startProcessing(
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
  ): Promise<PerfumeDTO[]> {
    const response: AxiosResponse<{ success?: boolean; data: PerfumeDTO[] } | PerfumeDTO[]> = await this.axiosInstance.post(
      "/processing/start",
      data,
      { headers: this.getAuthHeaders(token) }
    );
    const payload = (response.data as any).data ?? response.data;
    return payload as PerfumeDTO[];
  }
}
