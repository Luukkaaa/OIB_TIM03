import axios, { AxiosInstance, AxiosResponse } from "axios";
import { ISaleAPI } from "./ISaleAPI";
import { SaleDTO } from "../../models/sales/SaleDTO";
import { SalesSummary } from "../../models/reports/SalesSummary";

export class SaleAPI implements ISaleAPI {
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

  async getAllSales(token: string): Promise<SaleDTO[]> {
    const response: AxiosResponse<{ data?: SaleDTO[] } | SaleDTO[]> = await this.axiosInstance.get("/sales", {
      headers: this.getAuthHeaders(token),
    });
    return (response.data as any).data ?? (response.data as SaleDTO[]);
  }

  async searchSales(token: string, query: string): Promise<SaleDTO[]> {
    const response: AxiosResponse<{ data?: SaleDTO[] } | SaleDTO[]> = await this.axiosInstance.get(
      `/sales/search/${encodeURIComponent(query)}`,
      { headers: this.getAuthHeaders(token) }
    );
    return (response.data as any).data ?? (response.data as SaleDTO[]);
  }

  async getSalesSummary(
    token: string,
    params: { from?: string; to?: string; paymentMethod?: string; saleType?: string }
  ): Promise<SalesSummary> {
    const response: AxiosResponse<{ data?: SalesSummary } | SalesSummary> = await this.axiosInstance.get(
      "/reports/sales/summary",
      {
        params,
        headers: this.getAuthHeaders(token),
      }
    );
    return (response.data as any).data ?? (response.data as SalesSummary);
  }

  async exportSalesSummary(
    token: string,
    params: { from?: string; to?: string; paymentMethod?: string; saleType?: string; format?: string }
  ): Promise<{ blob: Blob; filename: string; contentType: string }> {
    const response = await this.axiosInstance.get("/reports/sales/summary/export", {
      params,
      responseType: "blob",
      headers: this.getAuthHeaders(token),
    });
    const disposition = response.headers["content-disposition"] as string | undefined;
    const match = disposition?.match(/filename=\"?([^\";]+)\"?/i);
    const filename = match?.[1] ?? "sales-summary.csv";
    const contentType = (response.headers["content-type"] as string | undefined) ?? "text/csv";
    return { blob: response.data, filename, contentType };
  }
}
