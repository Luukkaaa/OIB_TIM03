import axios, { AxiosInstance } from "axios";
import { IReportAPI } from "./IReportAPI";
import { ReportDTO } from "../../models/reports/ReportDTO";
import { ReportType } from "../../models/reports/ReportType";

export class ReportAPI implements IReportAPI {
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

  async listReports(token: string): Promise<ReportDTO[]> {
    const response = await this.axiosInstance.get<ReportDTO[] | { success?: boolean; data: ReportDTO[] }>("/reports", {
      headers: this.getAuthHeaders(token),
    });
    return (response.data as any).data ?? (response.data as ReportDTO[]);
  }

  async createReport(token: string, data: { title: string; type: ReportType; filters?: any }): Promise<ReportDTO> {
    const response = await this.axiosInstance.post<ReportDTO | { success?: boolean; data: ReportDTO }>("/reports", data, {
      headers: this.getAuthHeaders(token),
    });
    return (response.data as any).data ?? (response.data as ReportDTO);
  }

  async runReport(token: string, id: number, filters?: any): Promise<ReportDTO> {
    const response = await this.axiosInstance.post<ReportDTO | { success?: boolean; data: ReportDTO }>(
      `/reports/${id}/run`,
      { filters },
      { headers: this.getAuthHeaders(token) }
    );
    return (response.data as any).data ?? (response.data as ReportDTO);
  }

  async downloadReport(token: string, id: number): Promise<{ blob: Blob; filename: string; contentType: string }> {
    const response = await this.axiosInstance.get(`/reports/${id}/download`, {
      responseType: "blob",
      headers: this.getAuthHeaders(token),
    });
    const disposition = response.headers["content-disposition"] as string | undefined;
    const match = disposition?.match(/filename=\"?([^\";]+)\"?/i);
    const filename = match?.[1] ?? "report.csv";
    const contentType = (response.headers["content-type"] as string | undefined) ?? "text/csv";
    return { blob: response.data, filename, contentType };
  }
}
