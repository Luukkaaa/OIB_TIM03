import { UserRole } from "../enums/UserRole";

export interface UserSummaryDTO {
  totalCount: number;
  byRole: Array<{ role: UserRole; count: number }>;
}
