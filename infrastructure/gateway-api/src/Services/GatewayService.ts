import axios, { AxiosInstance } from "axios";
import { IGatewayService } from "../Domain/services/IGatewayService";
import { LoginUserDTO } from "../Domain/DTOs/LoginUserDTO";
import { RegistrationUserDTO } from "../Domain/DTOs/RegistrationUserDTO";
import { AuthResponseType } from "../Domain/types/AuthResponse";
import { UserDTO } from "../Domain/DTOs/UserDTO";
import { CreateUserDTO } from "../Domain/DTOs/CreateUserDTO";
import { UpdateUserDTO } from "../Domain/DTOs/UpdateUserDTO";
import { AuditLogDTO } from "../Domain/DTOs/AuditLogDTO";
import { CreateAuditLogDTO } from "../Domain/DTOs/CreateAuditLogDTO";
import { UpdateAuditLogDTO } from "../Domain/DTOs/UpdateAuditLogDTO";
import { PlantDTO } from "../Domain/DTOs/PlantDTO";
import { CreatePlantDTO } from "../Domain/DTOs/CreatePlantDTO";
import { UpdatePlantDTO } from "../Domain/DTOs/UpdatePlantDTO";
import { SeedPlantDTO } from "../Domain/DTOs/SeedPlantDTO";
import { AdjustStrengthDTO } from "../Domain/DTOs/AdjustStrengthDTO";
import { HarvestPlantsDTO } from "../Domain/DTOs/HarvestPlantsDTO";
import { PerfumeDTO } from "../Domain/DTOs/PerfumeDTO";
import { CreatePerfumeDTO } from "../Domain/DTOs/CreatePerfumeDTO";
import { UpdatePerfumeDTO } from "../Domain/DTOs/UpdatePerfumeDTO";
import { PackagingDTO } from "../Domain/DTOs/PackagingDTO";
import { CreatePackagingDTO } from "../Domain/DTOs/CreatePackagingDTO";
import { UpdatePackagingDTO } from "../Domain/DTOs/UpdatePackagingDTO";
import { WarehouseDTO } from "../Domain/DTOs/WarehouseDTO";
import { CreateWarehouseDTO } from "../Domain/DTOs/CreateWarehouseDTO";
import { UpdateWarehouseDTO } from "../Domain/DTOs/UpdateWarehouseDTO";
import { SaleDTO } from "../Domain/DTOs/SaleDTO";
import { CreateSaleDTO } from "../Domain/DTOs/CreateSaleDTO";
import { UpdateSaleDTO } from "../Domain/DTOs/UpdateSaleDTO";
import { SalesSummaryDTO } from "../Domain/DTOs/SalesSummaryDTO";
import { PlantSummaryDTO } from "../Domain/DTOs/PlantSummaryDTO";
import { PerfumeSummaryDTO } from "../Domain/DTOs/PerfumeSummaryDTO";
import { UserSummaryDTO } from "../Domain/DTOs/UserSummaryDTO";
import { ReportDTO } from "../Domain/DTOs/ReportDTO";
import { ReportType } from "../Domain/enums/ReportType";

export class GatewayService implements IGatewayService {
  private readonly authClient: AxiosInstance;
  private readonly userClient: AxiosInstance;
  private readonly auditClient: AxiosInstance;
  private readonly reportClient: AxiosInstance;
  private readonly plantClient: AxiosInstance;
  private readonly processingClient: AxiosInstance;
  private readonly packagingClient: AxiosInstance;
  private readonly storageClient: AxiosInstance;
  private readonly salesClient: AxiosInstance;

  constructor() {
    const authBaseURL = process.env.AUTH_SERVICE_API || "http://localhost:5544/api/v1";
    const userBaseURL = process.env.USER_SERVICE_API || "http://localhost:6754/api/v1";
    const auditBaseURL = process.env.AUDIT_SERVICE_API || "http://localhost:6000/api/v1";
    const plantBaseURL = process.env.PLANT_SERVICE_API || "http://localhost:6200/api/v1";
    const processingBaseURL = process.env.PROCESSING_SERVICE_API || "http://localhost:6300/api/v1";
    const packagingBaseURL = process.env.PACKAGING_SERVICE_API || "http://localhost:6400/api/v1";
    const storageBaseURL = process.env.STORAGE_SERVICE_API || "http://localhost:6500/api/v1";
    const salesBaseURL = process.env.SALES_SERVICE_API || "http://localhost:6600/api/v1";
    const reportBaseURL = process.env.REPORT_SERVICE_API || "http://localhost:6700/api/v1";
    const serviceKey = process.env.SERVICE_API_KEY ?? "dev-gateway-key";

    this.authClient = axios.create({
      baseURL: authBaseURL,
      headers: { "Content-Type": "application/json", "x-service-key": serviceKey },
      timeout: 5000,
    });

    this.userClient = axios.create({
      baseURL: userBaseURL,
      headers: { "Content-Type": "application/json", "x-service-key": serviceKey },
      timeout: 5000,
    });

    this.auditClient = axios.create({
      baseURL: auditBaseURL,
      headers: { "Content-Type": "application/json", "x-service-key": serviceKey },
      timeout: 5000,
    });
    this.reportClient = axios.create({
      baseURL: reportBaseURL,
      headers: { "Content-Type": "application/json", "x-service-key": serviceKey },
      timeout: 5000,
    });

    this.plantClient = axios.create({
      baseURL: plantBaseURL,
      headers: { "Content-Type": "application/json", "x-service-key": serviceKey },
      timeout: 5000,
    });

    this.processingClient = axios.create({
      baseURL: processingBaseURL,
      headers: { "Content-Type": "application/json", "x-service-key": serviceKey },
      timeout: 5000,
    });

    this.packagingClient = axios.create({
      baseURL: packagingBaseURL,
      headers: { "Content-Type": "application/json", "x-service-key": serviceKey },
      timeout: 5000,
    });

    this.storageClient = axios.create({
      baseURL: storageBaseURL,
      headers: { "Content-Type": "application/json", "x-service-key": serviceKey },
      timeout: 5000,
    });

    this.salesClient = axios.create({
      baseURL: salesBaseURL,
      headers: { "Content-Type": "application/json", "x-service-key": serviceKey },
      timeout: 5000,
    });
  }

  // Auth microservice
  async login(data: LoginUserDTO): Promise<AuthResponseType> {
    try {
      const response = await this.authClient.post<AuthResponseType>("/auth/login", data);
      return response.data;
    } catch (err: any) {
      const message = err?.response?.data?.message ?? "Login failed";
      return { success: false, message };
    }
  }

  async register(data: RegistrationUserDTO): Promise<AuthResponseType> {
    try {
      const response = await this.authClient.post<AuthResponseType>("/auth/register", data);
      return response.data;
    } catch (err: any) {
      const message = err?.response?.data?.message ?? "Registration failed";
      return { success: false, message };
    }
  }

  async logout(token: string): Promise<{ success: boolean; message: string }> {
    const response = await this.authClient.post<{ success: boolean; message: string }>(
      "/auth/logout",
      {},
      { headers: { Authorization: token } }
    );
    return response.data;
  }

  // User microservice
  async getAllUsers(): Promise<UserDTO[]> {
    const response = await this.userClient.get<UserDTO[]>("/users");
    return response.data;
  }

  async getUserById(id: number): Promise<UserDTO> {
    const response = await this.userClient.get<UserDTO>(`/users/${id}`);
    return response.data;
  }

  async createUser(data: CreateUserDTO): Promise<UserDTO> {
    const response = await this.userClient.post<UserDTO>("/users", data);
    return response.data;
  }

  async updateUser(id: number, data: UpdateUserDTO): Promise<UserDTO> {
    const response = await this.userClient.put<UserDTO>(`/users/${id}`, data);
    return response.data;
  }

  async deleteUser(id: number): Promise<void> {
    await this.userClient.delete(`/users/${id}`);
  }

  async searchUsers(query: string): Promise<UserDTO[]> {
    const response = await this.userClient.get<UserDTO[]>(`/users/search/${query}`);
    return response.data;
  }

  // Audit logs (secured by JWT; forward token)
  async getAllLogs(token: string): Promise<AuditLogDTO[]> {
    const response = await this.auditClient.get<{ data: AuditLogDTO[] }>("/logs", {
      headers: { Authorization: token },
    });
    return response.data.data;
  }

  async getLogById(token: string, id: number): Promise<AuditLogDTO> {
    const response = await this.auditClient.get<{ data: AuditLogDTO }>(`/logs/${id}`, {
      headers: { Authorization: token },
    });
    return response.data.data;
  }

  async createLog(token: string, data: CreateAuditLogDTO): Promise<AuditLogDTO> {
    const response = await this.auditClient.post<{ data: AuditLogDTO }>("/logs", data, {
      headers: { Authorization: token },
    });
    return response.data.data;
  }

  async updateLog(token: string, id: number, data: UpdateAuditLogDTO): Promise<AuditLogDTO> {
    const response = await this.auditClient.put<{ data: AuditLogDTO }>(`/logs/${id}`, data, {
      headers: { Authorization: token },
    });
    return response.data.data;
  }

  async deleteLog(token: string, id: number): Promise<void> {
    await this.auditClient.delete(`/logs/${id}`, {
      headers: { Authorization: token },
    });
  }

  async searchLogs(token: string, query: string): Promise<AuditLogDTO[]> {
    const response = await this.auditClient.get<{ data: AuditLogDTO[] }>(`/logs/search/${query}`, {
      headers: { Authorization: token },
    });
    return response.data.data;
  }

  // Plant microservice
  async getAllPlants(token: string): Promise<PlantDTO[]> {
    const response = await this.plantClient.get<{ data: PlantDTO[] }>("/plants", {
      headers: { Authorization: token },
    });
    return response.data.data;
  }

  async getPlantById(token: string, id: number): Promise<PlantDTO> {
    const response = await this.plantClient.get<{ data: PlantDTO }>(`/plants/${id}`, {
      headers: { Authorization: token },
    });
    return response.data.data;
  }

  async searchPlants(token: string, query: string): Promise<PlantDTO[]> {
    const response = await this.plantClient.get<{ data: PlantDTO[] }>(`/plants/search/${query}`, {
      headers: { Authorization: token },
    });
    return response.data.data;
  }

  async createPlant(token: string, data: CreatePlantDTO): Promise<PlantDTO> {
    const response = await this.plantClient.post<{ data: PlantDTO }>("/plants", data, {
      headers: { Authorization: token },
    });
    return response.data.data;
  }

  async updatePlant(token: string, id: number, data: UpdatePlantDTO): Promise<PlantDTO> {
    const response = await this.plantClient.put<{ data: PlantDTO }>(`/plants/${id}`, data, {
      headers: { Authorization: token },
    });
    return response.data.data;
  }

  async deletePlant(token: string, id: number): Promise<void> {
    await this.plantClient.delete(`/plants/${id}`, {
      headers: { Authorization: token },
    });
  }

  async seedPlant(token: string, data: SeedPlantDTO): Promise<PlantDTO> {
    const response = await this.plantClient.post<{ data: PlantDTO }>("/production/seed", data, {
      headers: { Authorization: token },
    });
    return response.data.data;
  }

  async adjustPlantStrength(token: string, data: AdjustStrengthDTO): Promise<PlantDTO> {
    const response = await this.plantClient.post<{ data: PlantDTO }>("/production/adjust-strength", data, {
      headers: { Authorization: token },
    });
    return response.data.data;
  }

  async harvestPlants(token: string, data: HarvestPlantsDTO): Promise<PlantDTO[]> {
    const response = await this.plantClient.post<{ data: PlantDTO[] }>("/production/harvest", data, {
      headers: { Authorization: token },
    });
    return response.data.data;
  }

  // Perfumes
  async getAllPerfumes(token: string): Promise<PerfumeDTO[]> {
    const response = await this.processingClient.get<{ data: PerfumeDTO[] }>("/perfumes", {
      headers: { Authorization: token },
    });
    return response.data.data;
  }

  async getPerfumeById(token: string, id: number): Promise<PerfumeDTO> {
    const response = await this.processingClient.get<{ data: PerfumeDTO }>(`/perfumes/${id}`, {
      headers: { Authorization: token },
    });
    return response.data.data;
  }

  async searchPerfumes(token: string, query: string): Promise<PerfumeDTO[]> {
    const response = await this.processingClient.get<{ data: PerfumeDTO[] }>(`/perfumes/search/${query}`, {
      headers: { Authorization: token },
    });
    return response.data.data;
  }

  async createPerfume(token: string, data: CreatePerfumeDTO): Promise<PerfumeDTO> {
    const response = await this.processingClient.post<{ data: PerfumeDTO }>("/perfumes", data, {
      headers: { Authorization: token },
    });
    return response.data.data;
  }

  async updatePerfume(token: string, id: number, data: UpdatePerfumeDTO): Promise<PerfumeDTO> {
    const response = await this.processingClient.put<{ data: PerfumeDTO }>(`/perfumes/${id}`, data, {
      headers: { Authorization: token },
    });
    return response.data.data;
  }

  async deletePerfume(token: string, id: number): Promise<void> {
    await this.processingClient.delete(`/perfumes/${id}`, {
      headers: { Authorization: token },
    });
  }

  async startProcessing(
    token: string,
    data: {
      perfumeName: string;
      perfumeType: string;
      bottleVolumeMl: number;
      bottleCount: number;
      plantId: number;
      expirationDate: string;
      serialPrefix?: string;
    }
  ): Promise<PerfumeDTO[]> {
    const response = await this.processingClient.post<{ data: PerfumeDTO[] }>("/processing/start", data, {
      headers: { Authorization: token },
    });
    return response.data.data;
  }

  // Packaging
  async getAllPackaging(token: string): Promise<PackagingDTO[]> {
    const response = await this.packagingClient.get<{ data: PackagingDTO[] }>("/packagings", {
      headers: { Authorization: token },
    });
    return response.data.data;
  }

  async getPackagingById(token: string, id: number): Promise<PackagingDTO> {
    const response = await this.packagingClient.get<{ data: PackagingDTO }>(`/packagings/${id}`, {
      headers: { Authorization: token },
    });
    return response.data.data;
  }

  async searchPackaging(token: string, query: string): Promise<PackagingDTO[]> {
    const response = await this.packagingClient.get<{ data: PackagingDTO[] }>(`/packagings/search/${query}`, {
      headers: { Authorization: token },
    });
    return response.data.data;
  }

  async createPackaging(token: string, data: CreatePackagingDTO): Promise<PackagingDTO> {
    const response = await this.packagingClient.post<{ data: PackagingDTO }>("/packagings", data, {
      headers: { Authorization: token },
    });
    return response.data.data;
  }

  async updatePackaging(token: string, id: number, data: UpdatePackagingDTO): Promise<PackagingDTO> {
    const response = await this.packagingClient.put<{ data: PackagingDTO }>(`/packagings/${id}`, data, {
      headers: { Authorization: token },
    });
    return response.data.data;
  }

  async deletePackaging(token: string, id: number): Promise<void> {
    await this.packagingClient.delete(`/packagings/${id}`, {
      headers: { Authorization: token },
    });
  }

  // Warehouses
  async getAllWarehouses(token: string): Promise<WarehouseDTO[]> {
    const response = await this.storageClient.get<{ data: WarehouseDTO[] }>("/warehouses", {
      headers: { Authorization: token },
    });
    return response.data.data;
  }

  async getWarehouseById(token: string, id: number): Promise<WarehouseDTO> {
    const response = await this.storageClient.get<{ data: WarehouseDTO }>(`/warehouses/${id}`, {
      headers: { Authorization: token },
    });
    return response.data.data;
  }

  async searchWarehouses(token: string, query: string): Promise<WarehouseDTO[]> {
    const response = await this.storageClient.get<{ data: WarehouseDTO[] }>(`/warehouses/search/${query}`, {
      headers: { Authorization: token },
    });
    return response.data.data;
  }

  async createWarehouse(token: string, data: CreateWarehouseDTO): Promise<WarehouseDTO> {
    const response = await this.storageClient.post<{ data: WarehouseDTO }>("/warehouses", data, {
      headers: { Authorization: token },
    });
    return response.data.data;
  }

  async updateWarehouse(token: string, id: number, data: UpdateWarehouseDTO): Promise<WarehouseDTO> {
    const response = await this.storageClient.put<{ data: WarehouseDTO }>(`/warehouses/${id}`, data, {
      headers: { Authorization: token },
    });
    return response.data.data;
  }

  async deleteWarehouse(token: string, id: number): Promise<void> {
    await this.storageClient.delete(`/warehouses/${id}`, {
      headers: { Authorization: token },
    });
  }

  // Sales
  async getAllSales(token: string): Promise<SaleDTO[]> {
    const response = await this.salesClient.get<{ data: SaleDTO[] }>("/sales", {
      headers: { Authorization: token },
    });
    return response.data.data;
  }

  async getSaleById(token: string, id: number): Promise<SaleDTO> {
    const response = await this.salesClient.get<{ data: SaleDTO }>(`/sales/${id}`, {
      headers: { Authorization: token },
    });
    return response.data.data;
  }

  async searchSales(token: string, query: string): Promise<SaleDTO[]> {
    const response = await this.salesClient.get<{ data: SaleDTO[] }>(`/sales/search/${query}`, {
      headers: { Authorization: token },
    });
    return response.data.data;
  }

  async createSale(token: string, data: CreateSaleDTO): Promise<SaleDTO> {
    const response = await this.salesClient.post<{ data: SaleDTO }>("/sales", data, {
      headers: { Authorization: token },
    });
    return response.data.data;
  }

  async updateSale(token: string, id: number, data: UpdateSaleDTO): Promise<SaleDTO> {
    const response = await this.salesClient.put<{ data: SaleDTO }>(`/sales/${id}`, data, {
      headers: { Authorization: token },
    });
    return response.data.data;
  }

  async deleteSale(token: string, id: number): Promise<void> {
    await this.salesClient.delete(`/sales/${id}`, {
      headers: { Authorization: token },
    });
  }

  async getSalesSummary(
    token: string,
    params: { from?: string; to?: string; paymentMethod?: string; saleType?: string }
  ): Promise<SalesSummaryDTO> {
    const response = await this.salesClient.get<{ success: boolean; data: SalesSummaryDTO }>(
      "/reports/sales/summary",
      {
        params,
        headers: { Authorization: token },
      }
    );
    return response.data.data;
  }

  async exportSalesSummary(
    token: string,
    params: { from?: string; to?: string; paymentMethod?: string; saleType?: string; format?: string }
  ): Promise<{ data: Buffer; contentType: string; filename: string }> {
    const response = await this.salesClient.get<ArrayBuffer>("/reports/sales/summary/export", {
      params,
      responseType: "arraybuffer",
      headers: { Authorization: token },
    });
    const contentType = response.headers["content-type"] ?? "text/csv";
    const disposition = response.headers["content-disposition"] as string | undefined;
    const filenameMatch = disposition?.match(/filename=\"?([^\";]+)\"?/i);
    const filename = filenameMatch?.[1] ?? "sales-summary.csv";
    return { data: Buffer.from(response.data), contentType, filename };
  }

  async getPlantSummary(token: string, params: { from?: string; to?: string; state?: string }): Promise<PlantSummaryDTO> {
    const response = await this.plantClient.get<{ success: boolean; data: PlantSummaryDTO }>(
      "/reports/plants/summary",
      { params, headers: { Authorization: token } }
    );
    return response.data.data;
  }

  async exportPlantSummary(
    token: string,
    params: { from?: string; to?: string; state?: string; format?: string }
  ): Promise<{ data: Buffer; contentType: string; filename: string }> {
    const response = await this.plantClient.get<ArrayBuffer>("/reports/plants/summary/export", {
      params,
      responseType: "arraybuffer",
      headers: { Authorization: token },
    });
    const contentType = response.headers["content-type"] ?? "text/csv";
    const disposition = response.headers["content-disposition"] as string | undefined;
    const filenameMatch = disposition?.match(/filename=\"?([^\";]+)\"?/i);
    const filename = filenameMatch?.[1] ?? "plant-summary.csv";
    return { data: Buffer.from(response.data), contentType, filename };
  }

  async getPerfumeSummary(token: string, params: { from?: string; to?: string; type?: string }): Promise<PerfumeSummaryDTO> {
    const response = await this.processingClient.get<{ success: boolean; data: PerfumeSummaryDTO }>(
      "/reports/perfumes/summary",
      { params, headers: { Authorization: token } }
    );
    return response.data.data;
  }

  async exportPerfumeSummary(
    token: string,
    params: { from?: string; to?: string; type?: string; format?: string }
  ): Promise<{ data: Buffer; contentType: string; filename: string }> {
    const response = await this.processingClient.get<ArrayBuffer>("/reports/perfumes/summary/export", {
      params,
      responseType: "arraybuffer",
      headers: { Authorization: token },
    });
    const contentType = response.headers["content-type"] ?? "text/csv";
    const disposition = response.headers["content-disposition"] as string | undefined;
    const filenameMatch = disposition?.match(/filename=\"?([^\";]+)\"?/i);
    const filename = filenameMatch?.[1] ?? "perfume-summary.csv";
    return { data: Buffer.from(response.data), contentType, filename };
  }

  async getUserSummary(token: string): Promise<UserSummaryDTO> {
    const response = await this.userClient.get<{ success: boolean; data: UserSummaryDTO }>("/reports/users/summary", {
      headers: { Authorization: token },
    });
    return response.data.data;
  }

  async exportUserSummary(token: string): Promise<{ data: Buffer; contentType: string; filename: string }> {
    const response = await this.userClient.get<ArrayBuffer>("/reports/users/summary/export", {
      responseType: "arraybuffer",
      headers: { Authorization: token },
    });
    const contentType = response.headers["content-type"] ?? "text/csv";
    const disposition = response.headers["content-disposition"] as string | undefined;
    const filenameMatch = disposition?.match(/filename=\"?([^\";]+)\"?/i);
    const filename = filenameMatch?.[1] ?? "users-summary.csv";
    return { data: Buffer.from(response.data), contentType, filename };
  }

  async createReport(token: string, data: { title: string; type: ReportType; filters?: any }): Promise<ReportDTO> {
    const response = await this.reportClient.post<{ success: boolean; data: ReportDTO }>("/reports", data, {
      headers: { Authorization: token },
    });
    return response.data.data;
  }

  async listReports(token: string): Promise<ReportDTO[]> {
    const response = await this.reportClient.get<{ success: boolean; data: ReportDTO[] }>("/reports", {
      headers: { Authorization: token },
    });
    return response.data.data;
  }

  async runReport(token: string, id: number, filters?: any): Promise<ReportDTO> {
    const response = await this.reportClient.post<{ success: boolean; data: ReportDTO }>(
      `/reports/${id}/run`,
      { filters },
      { headers: { Authorization: token } }
    );
    return response.data.data;
  }

  async downloadReport(token: string, id: number): Promise<{ data: Buffer; contentType: string; filename: string }> {
    const response = await this.reportClient.get<ArrayBuffer>(`/reports/${id}/download`, {
      responseType: "arraybuffer",
      headers: { Authorization: token },
    });
    const contentType = response.headers["content-type"] ?? "text/csv";
    const disposition = response.headers["content-disposition"] as string | undefined;
    const filenameMatch = disposition?.match(/filename=\"?([^\";]+)\"?/i);
    const filename = filenameMatch?.[1] ?? "report.csv";
    return { data: Buffer.from(response.data), contentType, filename };
  }
}
