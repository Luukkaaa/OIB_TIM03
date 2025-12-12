export interface UserSummaryDTO {
  totalCount: number;
  byRole: Array<{ role: string; count: number }>;
}
