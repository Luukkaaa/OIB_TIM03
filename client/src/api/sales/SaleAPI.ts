import axios, { AxiosInstance, AxiosResponse } from "axios";
import { ISaleAPI } from "./ISaleAPI";
import { SaleDTO } from "../../models/sales/SaleDTO";

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
}
