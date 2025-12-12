import axios, { AxiosInstance } from "axios";
import jwt from "jsonwebtoken";
import { LogType } from "../Domain/enums/LogType";

export class AuditLogClient {
  private readonly client: AxiosInstance;
  private readonly serviceToken: string;
  private readonly serviceKey: string;

  constructor() {
    const baseURL =
      process.env.AUDIT_SERVICE_API ||
      "http://audit-microservice:6000/api/v1" ||
      "http://localhost:6000/api/v1";
    const secret = process.env.JWT_SECRET || "";
    this.serviceKey = process.env.SERVICE_API_KEY || "";

    this.client = axios.create({
      baseURL,
      headers: { "Content-Type": "application/json", "x-service-key": this.serviceKey },
      timeout: 3000,
    });

    this.serviceToken = secret
      ? jwt.sign({ id: 0, username: "gateway-api", role: "admin" }, secret, { expiresIn: "1h" })
      : "";
  }

  async log(type: LogType, description: string): Promise<void> {
    if (!this.serviceToken) return;
    try {
      await this.client.post(
        "/logs",
        { type, description },
        { headers: { Authorization: `Bearer ${this.serviceToken}`, "x-service-key": this.serviceKey } }
      );
    } catch (err) {
      const status = (err as any)?.response?.status;
      const msg = (err as any)?.response?.data?.message;
      console.error("[GatewayAuditLog] Failed to send log", status ?? "", msg ?? err);
    }
  }
}
