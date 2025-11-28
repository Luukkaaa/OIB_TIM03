import { UserRole } from "../enums/UserRole";

export interface UpdateUserDTO {
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  password?: string;
  email?: string;
  profileImage?: string | null;
}
