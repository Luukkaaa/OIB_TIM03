export interface PerfumeSummaryDTO {
  from?: string;
  to?: string;
  totalCount: number;
  averageVolume: number;
  byType: Array<{ type: string; count: number; averageVolume: number }>;
}
