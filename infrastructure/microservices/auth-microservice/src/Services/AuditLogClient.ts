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

    this.serviceToken = jwt.sign(
      { id: 0, username: "auth-service", role: "admin" },
      secret,
      { expiresIn: "1h" }
    );
  }

  async log(type: LogType, description: string): Promise<void> {
    try {
      await this.client.post(
        "/logs",
        { type, description },
        { headers: { Authorization: `Bearer ${this.serviceToken}` } }
      );
    } catch (err) {
      // Ne zaustavlja главну логику ако audit закаже
      console.error("[AuditLog] Failed to send log", err);
    }
  }
}
