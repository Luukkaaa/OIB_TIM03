import { UserDTO } from "../../models/users/UserDTO";
import { CreateUserDTO } from "../../models/users/CreateUserDTO";
import { UpdateUserDTO } from "../../models/users/UpdateUserDTO";

export interface IUserAPI {
  getAllUsers(token: string): Promise<UserDTO[]>;
  getUserById(token: string, id: number): Promise<UserDTO>;
  searchUsers(token: string, query: string): Promise<UserDTO[]>;
  createUser(token: string, data: CreateUserDTO): Promise<UserDTO>;
  updateUser(token: string, id: number, data: UpdateUserDTO): Promise<UserDTO>;
  deleteUser(token: string, id: number): Promise<void>;
}
