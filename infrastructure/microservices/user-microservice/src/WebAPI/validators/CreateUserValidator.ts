import { CreateUserDTO } from "../../Domain/DTOs/CreateUserDTO";
import { UserRole } from "../../Domain/enums/UserRole";

const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;

export function validateCreateUser(data: CreateUserDTO): { success: boolean; message?: string } {
  if (!data.username || data.username.trim().length < 3) {
    return { success: false, message: "Username must be at least 3 characters long" };
  }
  if (!data.firstName || data.firstName.trim().length < 2) {
    return { success: false, message: "First name must be at least 2 characters long" };
  }
  if (!data.lastName || data.lastName.trim().length < 2) {
    return { success: false, message: "Last name must be at least 2 characters long" };
  }
  if (!data.password || data.password.length < 6) {
    return { success: false, message: "Password must be at least 6 characters long" };
  }
  if (!data.email || !emailRegex.test(data.email)) {
    return { success: false, message: "Invalid email address" };
  }
  if (!Object.values(UserRole).includes(data.role)) {
    return { success: false, message: "Invalid role" };
  }

  return { success: true };
}
