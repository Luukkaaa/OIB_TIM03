import axios, { AxiosInstance } from "axios";
import jwt from "jsonwebtoken";

// Lokalna kopija stanja biljke
export enum PlantState {
  PLANTED = "PLANTED",
  HARVESTED = "HARVESTED",
  PROCESSED = "PROCESSED",
}

// Lokalni DTO za rad sa proizvodnjom preko gateway-a/production servisa
export interface PlantDTO {
  id: number;
  commonName: string;
  latinName: string;
  originCountry: string;
  oilStrength: number;
  quantity?: number;
  state: PlantState | string;
}

export class ProductionClient {
  private client: AxiosInstance;
  private serviceToken: string;

  constructor() {
    const baseURL = process.env.PRODUCTION_SERVICE_API || "http://localhost:6200/api/v1";
    const secret = process.env.JWT_SECRET || "";
    const presetToken = process.env.PRODUCTION_SERVICE_TOKEN;
    const serviceKey = process.env.SERVICE_API_KEY || "";

    this.client = axios.create({
      baseURL,
      headers: { "Content-Type": "application/json", "x-service-key": serviceKey },
      timeout: 3000,
    });

    this.serviceToken =
      presetToken || (secret ? jwt.sign({ id: 0, username: "processing-service", role: "admin" }, secret, { expiresIn: "1h" }) : "");
  }

  private headers() {
    return this.serviceToken ? { Authorization: `Bearer ${this.serviceToken}` } : {};
  }

  async getPlantById(id: number): Promise<PlantDTO> {
    const res = await this.client.get<{ data: PlantDTO } | PlantDTO>(`/plants/${id}`, { headers: this.headers() });
    return (res.data as any).data ?? (res.data as PlantDTO);
  }

  async seedPlant(data: { commonName: string; latinName: string; originCountry: string; oilStrength?: number; quantity?: number }): Promise<PlantDTO> {
    const res = await this.client.post<{ data: PlantDTO } | PlantDTO>("/production/seed", data, { headers: this.headers() });
    return (res.data as any).data ?? (res.data as PlantDTO);
  }

  async adjustStrength(plantId: number, targetPercent: number): Promise<PlantDTO> {
    const res = await this.client.post<{ data: PlantDTO } | PlantDTO>("/production/adjust-strength", { plantId, targetPercent }, { headers: this.headers() });
    return (res.data as any).data ?? (res.data as PlantDTO);
  }

  async harvest(commonName: string, count: number): Promise<PlantDTO[]> {
    const res = await this.client.post<{ data: PlantDTO[] } | PlantDTO[]>("/production/harvest", { commonName, count }, { headers: this.headers() });
    return (res.data as any).data ?? (res.data as PlantDTO[]);
  }
}
