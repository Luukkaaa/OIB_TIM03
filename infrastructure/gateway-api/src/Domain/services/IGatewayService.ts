import { LoginUserDTO } from "../DTOs/LoginUserDTO";
import { RegistrationUserDTO } from "../DTOs/RegistrationUserDTO";
import { UserDTO } from "../DTOs/UserDTO";
import { AuthResponseType } from "../types/AuthResponse";
import { CreateUserDTO } from "../DTOs/CreateUserDTO";
import { UpdateUserDTO } from "../DTOs/UpdateUserDTO";
import { AuditLogDTO } from "../DTOs/AuditLogDTO";
import { CreateAuditLogDTO } from "../DTOs/CreateAuditLogDTO";
import { UpdateAuditLogDTO } from "../DTOs/UpdateAuditLogDTO";

export interface IGatewayService {
  // Auth
  login(data: LoginUserDTO): Promise<AuthResponseType>;
  register(data: RegistrationUserDTO): Promise<AuthResponseType>;
  logout(token: string): Promise<{ success: boolean; message: string }>;

  // Users
  getAllUsers(): Promise<UserDTO[]>;
  getUserById(id: number): Promise<UserDTO>;
  createUser(data: CreateUserDTO): Promise<UserDTO>;
  updateUser(id: number, data: UpdateUserDTO): Promise<UserDTO>;
  deleteUser(id: number): Promise<void>;
  searchUsers(query: string): Promise<UserDTO[]>;

  // Audit logs
  getAllLogs(token: string): Promise<AuditLogDTO[]>;
  getLogById(token: string, id: number): Promise<AuditLogDTO>;
  createLog(token: string, data: CreateAuditLogDTO): Promise<AuditLogDTO>;
  updateLog(token: string, id: number, data: UpdateAuditLogDTO): Promise<AuditLogDTO>;
  deleteLog(token: string, id: number): Promise<void>;
  searchLogs(token: string, query: string): Promise<AuditLogDTO[]>;
}

