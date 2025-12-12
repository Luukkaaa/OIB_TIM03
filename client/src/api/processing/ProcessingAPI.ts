import axios, { AxiosInstance, AxiosResponse } from "axios";
import { IProcessingAPI } from "./IProcessingAPI";
import { PerfumeDTO } from "../../models/processing/PerfumeDTO";
import { PerfumeType } from "../../models/processing/PerfumeType";
import { PerfumeSummary } from "../../models/reports/PerfumeSummary";

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

  async getPerfumeSummary(
    token: string,
    params: { from?: string; to?: string; type?: string }
  ): Promise<PerfumeSummary> {
    const response: AxiosResponse<{ success?: boolean; data: PerfumeSummary } | PerfumeSummary> = await this.axiosInstance.get(
      "/reports/perfumes/summary",
      { params, headers: this.getAuthHeaders(token) }
    );
    return (response.data as any).data ?? (response.data as PerfumeSummary);
  }

  async exportPerfumeSummary(
    token: string,
    params: { from?: string; to?: string; type?: string; format?: string }
  ): Promise<{ blob: Blob; filename: string; contentType: string }> {
    const response = await this.axiosInstance.get("/reports/perfumes/summary/export", {
      params,
      responseType: "blob",
      headers: this.getAuthHeaders(token),
    });
    const disposition = response.headers["content-disposition"] as string | undefined;
    const match = disposition?.match(/filename=\"?([^\";]+)\"?/i);
    const filename = match?.[1] ?? "perfume-summary.csv";
    const contentType = (response.headers["content-type"] as string | undefined) ?? "text/csv";
    return { blob: response.data, filename, contentType };
  }
}
