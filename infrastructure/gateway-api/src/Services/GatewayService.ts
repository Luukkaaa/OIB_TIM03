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

export class GatewayService implements IGatewayService {
  private readonly authClient: AxiosInstance;
  private readonly userClient: AxiosInstance;
  private readonly auditClient: AxiosInstance;
  private readonly plantClient: AxiosInstance;

  constructor() {
    const authBaseURL = process.env.AUTH_SERVICE_API || "http://localhost:5544/api/v1";
    const userBaseURL = process.env.USER_SERVICE_API || "http://localhost:6754/api/v1";
    const auditBaseURL = process.env.AUDIT_SERVICE_API || "http://localhost:6000/api/v1";
    const plantBaseURL = process.env.PLANT_SERVICE_API || "http://localhost:6200/api/v1";
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

    this.plantClient = axios.create({
      baseURL: plantBaseURL,
      headers: { "Content-Type": "application/json", "x-service-key": serviceKey },
      timeout: 5000,
    });
  }

  // Auth microservice
  async login(data: LoginUserDTO): Promise<AuthResponseType> {
    try {
      const response = await this.authClient.post<AuthResponseType>("/auth/login", data);
      return response.data;
    } catch {
      return { authenificated: false };
    }
  }

  async register(data: RegistrationUserDTO): Promise<AuthResponseType> {
    try {
      const response = await this.authClient.post<AuthResponseType>("/auth/register", data);
      return response.data;
    } catch {
      return { authenificated: false };
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
}
