import axios, { AxiosInstance } from "axios";
import jwt from "jsonwebtoken";
import { LogType } from "./LogType";

export class AuditLogClient {
  private client: AxiosInstance;
  private serviceToken: string;

  constructor() {
    const baseURL = process.env.AUDIT_SERVICE_API || "http://localhost:6000/api/v1";
    const secret = process.env.JWT_SECRET || "";
    const serviceKey = process.env.SERVICE_API_KEY || "";

    this.client = axios.create({
      baseURL,
      headers: { "Content-Type": "application/json", "x-service-key": serviceKey },
      timeout: 3000,
    });

    this.serviceToken = secret
      ? jwt.sign({ id: 0, username: "sales-service", role: "admin" }, secret, { expiresIn: "1h" })
      : "";
  }

  async log(type: LogType, description: string): Promise<void> {
    if (!this.serviceToken) {
      console.warn("[AuditLog] JWT_SECRET nije postavljen; preskacem slanje loga");
      return;
    }
    try {
      await this.client.post(
        "/logs",
        { type, description },
        { headers: { Authorization: `Bearer ${this.serviceToken}` } }
      );
    } catch (err) {
      console.error("[AuditLog] Failed to send log", err);
    }
  }
}
