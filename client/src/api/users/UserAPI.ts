import axios, { AxiosInstance } from "axios";
import { IUserAPI } from "./IUserAPI";
import { UserDTO } from "../../models/users/UserDTO";
import { CreateUserDTO } from "../../models/users/CreateUserDTO";
import { UpdateUserDTO } from "../../models/users/UpdateUserDTO";

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
}
