import { UserRole } from "../../enums/UserRole";

export interface RegistrationUserDTO {
  username: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  password: string;
  email: string;
  profileImage: string;
}
