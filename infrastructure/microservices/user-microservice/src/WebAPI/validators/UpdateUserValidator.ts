import { UpdateUserDTO } from "../../Domain/DTOs/UpdateUserDTO";
import { UserRole } from "../../Domain/enums/UserRole";

const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;

export function validateUpdateUser(data: UpdateUserDTO): { success: boolean; message?: string } {
  if (!data || Object.keys(data).length === 0) {
    return { success: false, message: "No data provided for update" };
  }

  if (data.firstName !== undefined && data.firstName.trim().length < 2) {
    return { success: false, message: "First name must be at least 2 characters long" };
  }

  if (data.lastName !== undefined && data.lastName.trim().length < 2) {
    return { success: false, message: "Last name must be at least 2 characters long" };
  }

  if (data.password !== undefined && data.password.length < 6) {
    return { success: false, message: "Password must be at least 6 characters long" };
  }

  if (data.email !== undefined && !emailRegex.test(data.email)) {
    return { success: false, message: "Invalid email address" };
  }

  if (data.role !== undefined && !Object.values(UserRole).includes(data.role)) {
    return { success: false, message: "Invalid role" };
  }

  return { success: true };
}
