import { UserRole } from "../../enums/UserRole";

export interface CreateUserDTO {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  profileImage?: string;
}
