import { UserRole } from "../enums/UserRole";

export interface UpdateUserDTO {
  username?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  password?: string;
  email?: string;
  profileImage?: string | null;
}
