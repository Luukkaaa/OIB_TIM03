import axios, { AxiosInstance, AxiosResponse } from "axios";
import { PlantDTO } from "../../models/plants/PlantDTO";
import { IPlantAPI } from "./IPlantAPI";
import { CreatePlantDTO } from "../../models/plants/CreatePlantDTO";
import { UpdatePlantDTO } from "../../models/plants/UpdatePlantDTO";
import { PlantSummary } from "../../models/reports/PlantSummary";

export class PlantAPI implements IPlantAPI {
  private readonly axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: import.meta.env.VITE_GATEWAY_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  private getAuthHeaders(token: string) {
    return { Authorization: `Bearer ${token}` };
  }

  async getAllPlants(token: string): Promise<PlantDTO[]> {
    const response: AxiosResponse<{ success?: boolean; data: PlantDTO[] } | PlantDTO[]> = await this.axiosInstance.get("/plants", {
      headers: this.getAuthHeaders(token),
    });
    const payload = (response.data as any).data ?? response.data;
    return payload as PlantDTO[];
  }

  async getPlantById(id: number, token: string): Promise<PlantDTO> {
    const response: AxiosResponse<{ success?: boolean; data: PlantDTO } | PlantDTO> = await this.axiosInstance.get(`/plants/${id}`, {
      headers: this.getAuthHeaders(token),
    });
    return (response.data as any).data ?? (response.data as PlantDTO);
  }

  async searchPlants(token: string, query: string): Promise<PlantDTO[]> {
    const response: AxiosResponse<{ success?: boolean; data: PlantDTO[] } | PlantDTO[]> = await this.axiosInstance.get(`/plants/search/${encodeURIComponent(query)}`, {
      headers: this.getAuthHeaders(token),
    });
    const payload = (response.data as any).data ?? response.data;
    return payload as PlantDTO[];
  }

  async createPlant(token: string, plant: CreatePlantDTO): Promise<PlantDTO> {
    const response: AxiosResponse<{ success?: boolean; data: PlantDTO } | PlantDTO> = await this.axiosInstance.post("/plants", plant, {
      headers: this.getAuthHeaders(token),
    });
    return (response.data as any).data ?? (response.data as PlantDTO);
  }

  async updatePlant(token: string, id: number, plant: UpdatePlantDTO): Promise<PlantDTO> {
    const response: AxiosResponse<{ success?: boolean; data: PlantDTO } | PlantDTO> = await this.axiosInstance.put(`/plants/${id}`, plant, {
      headers: this.getAuthHeaders(token),
    });
    return (response.data as any).data ?? (response.data as PlantDTO);
  }

  async deletePlant(token: string, id: number): Promise<void> {
    await this.axiosInstance.delete(`/plants/${id}`, {
      headers: this.getAuthHeaders(token),
    });
  }

  async seedPlant(token: string, data: { commonName: string; latinName: string; originCountry: string; oilStrength?: number; quantity?: number }): Promise<PlantDTO> {
    const response: AxiosResponse<{ data: PlantDTO } | PlantDTO> = await this.axiosInstance.post("/production/seed", data, {
      headers: this.getAuthHeaders(token),
    });
    return (response.data as any).data ?? (response.data as PlantDTO);
  }

  async adjustStrength(token: string, data: { plantId: number; targetPercent: number }): Promise<PlantDTO> {
    const response: AxiosResponse<{ data: PlantDTO } | PlantDTO> = await this.axiosInstance.post("/production/adjust-strength", data, {
      headers: this.getAuthHeaders(token),
    });
    return (response.data as any).data ?? (response.data as PlantDTO);
  }

  async harvestPlants(token: string, data: { commonName: string; count: number }): Promise<PlantDTO[]> {
    const response: AxiosResponse<{ data: PlantDTO[] } | PlantDTO[]> = await this.axiosInstance.post("/production/harvest", data, {
      headers: this.getAuthHeaders(token),
    });
    return (response.data as any).data ?? (response.data as PlantDTO[]);
  }

  async getPlantSummary(
    token: string,
    params: { from?: string; to?: string; state?: string }
  ): Promise<PlantSummary> {
    const response: AxiosResponse<{ success?: boolean; data: PlantSummary } | PlantSummary> = await this.axiosInstance.get(
      "/reports/plants/summary",
      { params, headers: this.getAuthHeaders(token) }
    );
    return (response.data as any).data ?? (response.data as PlantSummary);
  }

  async exportPlantSummary(
    token: string,
    params: { from?: string; to?: string; state?: string; format?: string }
  ): Promise<{ blob: Blob; filename: string; contentType: string }> {
    const response = await this.axiosInstance.get("/reports/plants/summary/export", {
      params,
      responseType: "blob",
      headers: this.getAuthHeaders(token),
    });
    const disposition = response.headers["content-disposition"] as string | undefined;
    const match = disposition?.match(/filename=\"?([^\";]+)\"?/i);
    const filename = match?.[1] ?? "plant-summary.csv";
    const contentType = (response.headers["content-type"] as string | undefined) ?? "text/csv";
    return { blob: response.data, filename, contentType };
  }
}

