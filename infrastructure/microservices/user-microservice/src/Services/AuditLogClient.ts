import axios, { AxiosInstance } from "axios";
import jwt from "jsonwebtoken";
import { LogType } from "../audit-types/LogType";

export class AuditLogClient {
  private client: AxiosInstance;
  private serviceToken: string;

  constructor() {
    const baseURL = process.env.AUDIT_SERVICE_API || "http://localhost:6000/api/v1";
    const secret = process.env.JWT_SECRET || "";

    this.client = axios.create({
      baseURL,
      headers: { "Content-Type": "application/json" },
      timeout: 3000,
    });

    this.serviceToken = secret
      ? jwt.sign({ id: 0, username: "user-service", role: "admin" }, secret, { expiresIn: "1h" })
      : "";
  }

  async log(type: LogType, description: string): Promise<void> {
    if (!this.serviceToken) {
      console.warn("[AuditLog] JWT_SECRET nije postavljen; preskačem slanje loga");
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
