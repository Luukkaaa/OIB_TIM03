import axios, { AxiosInstance } from "axios";
import jwt from "jsonwebtoken";
import { ReportType } from "../Domain/enums/ReportType";

type SalesSummary = {
  totalCount: number;
  totalAmount: number;
  averageAmount: number;
  byPaymentMethod: Array<{ paymentMethod: string; totalAmount: number; count: number; averageAmount: number }>;
  bySaleType: Array<{ saleType: string; totalAmount: number; count: number; averageAmount: number }>;
};

type PlantSummary = {
  totalSpecies: number;
  totalQuantity: number;
  averageOilStrength: number;
  byState: Array<{ state: string; count: number; quantity: number }>;
};

type PerfumeSummary = {
  totalCount: number;
  averageVolume: number;
  byType: Array<{ type: string; count: number; averageVolume: number }>;
};

type UserSummary = {
  totalCount: number;
  byRole: Array<{ role: string; count: number }>;
};

export class SummaryClient {
  private readonly sales: AxiosInstance;
  private readonly plants: AxiosInstance;
  private readonly perfumes: AxiosInstance;
  private readonly users: AxiosInstance;
  private readonly serviceKey: string;
  private readonly token: string;

  constructor() {
    const secret = process.env.JWT_SECRET || "";
    this.serviceKey = process.env.SERVICE_API_KEY || "dev-gateway-key";

    this.sales = axios.create({
      baseURL: process.env.SALES_SERVICE_API || "http://sales-microservice:6600/api/v1",
      headers: { "Content-Type": "application/json", "x-service-key": this.serviceKey },
      timeout: 5000,
    });
    this.plants = axios.create({
      baseURL: process.env.PLANT_SERVICE_API || "http://plant-microservice:6200/api/v1",
      headers: { "Content-Type": "application/json", "x-service-key": this.serviceKey },
      timeout: 5000,
    });
    this.perfumes = axios.create({
      baseURL: process.env.PROCESSING_SERVICE_API || "http://processing-microservice:6300/api/v1",
      headers: { "Content-Type": "application/json", "x-service-key": this.serviceKey },
      timeout: 5000,
    });
    this.users = axios.create({
      baseURL: process.env.USER_SERVICE_API || "http://user-microservice:6754/api/v1",
      headers: { "Content-Type": "application/json", "x-service-key": this.serviceKey },
      timeout: 5000,
    });

    this.token = secret ? jwt.sign({ id: 0, username: "report-service", role: "admin" }, secret, { expiresIn: "1h" }) : "";
  }

  private authHeader() {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }

  async fetchSummary(type: ReportType, filters: Record<string, unknown>): Promise<any> {
    switch (type) {
      case ReportType.SALES: {
        const res = await this.sales.get<{ data: SalesSummary } | SalesSummary>("/reports/sales/summary", {
          params: filters,
          headers: this.authHeader(),
        });
        return (res.data as any).data ?? res.data;
      }
      case ReportType.PLANTS: {
        const res = await this.plants.get<{ data: PlantSummary } | PlantSummary>("/reports/plants/summary", {
          params: filters,
          headers: this.authHeader(),
        });
        return (res.data as any).data ?? res.data;
      }
      case ReportType.PERFUMES: {
        const res = await this.perfumes.get<{ data: PerfumeSummary } | PerfumeSummary>("/reports/perfumes/summary", {
          params: filters,
          headers: this.authHeader(),
        });
        return (res.data as any).data ?? res.data;
      }
      case ReportType.USERS: {
        const res = await this.users.get<{ data: UserSummary } | UserSummary>("/reports/users/summary", {
          headers: this.authHeader(),
        });
        return (res.data as any).data ?? res.data;
      }
      default:
        throw new Error("Nepodržan tip izveštaja");
    }
  }
}
