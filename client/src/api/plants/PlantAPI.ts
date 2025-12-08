import axios, { AxiosInstance, AxiosResponse } from "axios";
import { PlantDTO } from "../../models/plants/PlantDTO";
import { IPlantAPI } from "./IPlantAPI";
import { CreatePlantDTO } from "../../models/plants/CreatePlantDTO";
import { UpdatePlantDTO } from "../../models/plants/UpdatePlantDTO";

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
}


