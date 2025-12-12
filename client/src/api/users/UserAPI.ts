import axios, { AxiosInstance } from "axios";
import { IUserAPI } from "./IUserAPI";
import { UserDTO } from "../../models/users/UserDTO";
import { CreateUserDTO } from "../../models/users/CreateUserDTO";
import { UpdateUserDTO } from "../../models/users/UpdateUserDTO";
import { UserSummary } from "../../models/reports/UserSummary";

export class UserAPI implements IUserAPI {
  private readonly axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: import.meta.env.VITE_GATEWAY_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async getAllUsers(token: string): Promise<UserDTO[]> {
    return (
      await this.axiosInstance.get<UserDTO[]>("/users", {
        headers: { Authorization: `Bearer ${token}` },
      })
    ).data;
  }

  async getUserById(token: string, id: number): Promise<UserDTO> {
    return (
      await this.axiosInstance.get<UserDTO>(`/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
    ).data;
  }

  async searchUsers(token: string, query: string): Promise<UserDTO[]> {
    return (
      await this.axiosInstance.get<UserDTO[]>(`/users/search/${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
    ).data;
  }

  async createUser(token: string, data: CreateUserDTO): Promise<UserDTO> {
    return (
      await this.axiosInstance.post<UserDTO>("/users", data, {
        headers: { Authorization: `Bearer ${token}` },
      })
    ).data;
  }

  async updateUser(token: string, id: number, data: UpdateUserDTO): Promise<UserDTO> {
    return (
      await this.axiosInstance.put<UserDTO>(`/users/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      })
    ).data;
  }

  async deleteUser(token: string, id: number): Promise<void> {
    await this.axiosInstance.delete(`/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async getUserSummary(token: string): Promise<UserSummary> {
    const response = await this.axiosInstance.get<{ success?: boolean; data: UserSummary } | UserSummary>(
      "/reports/users/summary",
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return (response.data as any).data ?? (response.data as UserSummary);
  }

  async exportUserSummary(token: string): Promise<{ blob: Blob; filename: string; contentType: string }> {
    const response = await this.axiosInstance.get("/reports/users/summary/export", {
      responseType: "blob",
      headers: { Authorization: `Bearer ${token}` },
    });
    const disposition = response.headers["content-disposition"] as string | undefined;
    const match = disposition?.match(/filename=\"?([^\";]+)\"?/i);
    const filename = match?.[1] ?? "users-summary.csv";
    const contentType = (response.headers["content-type"] as string | undefined) ?? "text/csv";
    return { blob: response.data, filename, contentType };
  }
}
