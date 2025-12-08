import axios, { AxiosInstance } from "axios";
import jwt from "jsonwebtoken";

export enum PerfumeType {
  PARFEM = "PARFEM",
  KOLONJSKA_VODA = "KOLONJSKA_VODA",
}

type ProcessRequest = {
  perfumeName: string;
  perfumeType: PerfumeType;
  bottleVolumeMl: number;
  bottleCount: number;
  plantId: number;
  expirationDate: string;
  serialPrefix?: string;
};

type PerfumeDTO = {
  id: number;
  name: string;
  type: PerfumeType | string;
  netQuantityMl: number;
  serialNumber: string;
  plantId: number;
  expirationDate: string;
};

export class ProcessingClient {
  private client: AxiosInstance;
  private serviceToken: string;

  constructor() {
    const baseURL = process.env.PROCESSING_SERVICE_API || "http://localhost:6000/api/v1";
    const secret = process.env.JWT_SECRET || "";
    const serviceKey = process.env.SERVICE_API_KEY || "";

    this.client = axios.create({
      baseURL,
      headers: { "Content-Type": "application/json", "x-service-key": serviceKey },
      timeout: 3000,
    });

    this.serviceToken = secret
      ? jwt.sign({ id: 0, username: "packaging-service", role: "admin" }, secret, { expiresIn: "1h" })
      : "";
  }

  private headers() {
    if (!this.serviceToken) throw new Error("JWT_SECRET nije postavljen za ProcessingClient");
    return { Authorization: `Bearer ${this.serviceToken}` };
  }

  async startProcessing(req: ProcessRequest): Promise<PerfumeDTO[]> {
    const res = await this.client.post<{ data: PerfumeDTO[] } | PerfumeDTO[]>("/processing/start", req, {
      headers: this.headers(),
    });
    return (res.data as any).data ?? (res.data as PerfumeDTO[]);
  }
}
