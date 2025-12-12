import { UserDTO } from "../../models/users/UserDTO";
import { CreateUserDTO } from "../../models/users/CreateUserDTO";
import { UpdateUserDTO } from "../../models/users/UpdateUserDTO";
import { UserSummary } from "../../models/reports/UserSummary";

export interface IUserAPI {
  getAllUsers(token: string): Promise<UserDTO[]>;
  getUserById(token: string, id: number): Promise<UserDTO>;
  searchUsers(token: string, query: string): Promise<UserDTO[]>;
  createUser(token: string, data: CreateUserDTO): Promise<UserDTO>;
  updateUser(token: string, id: number, data: UpdateUserDTO): Promise<UserDTO>;
  deleteUser(token: string, id: number): Promise<void>;
  getUserSummary(token: string): Promise<UserSummary>;
  exportUserSummary(token: string): Promise<{ blob: Blob; filename: string; contentType: string }>;
}
