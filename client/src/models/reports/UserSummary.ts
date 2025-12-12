export type UserSummary = {
  totalCount: number;
  byRole: Array<{
    role: string;
    count: number;
  }>;
};
