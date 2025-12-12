import { PerfumeType } from "../enums/PerfumeType";

export interface PerfumeSummaryDTO {
  from?: string;
  to?: string;
  totalCount: number;
  averageVolume: number;
  byType: Array<{ type: PerfumeType; count: number; averageVolume: number }>;
}

export interface PerfumeSummaryFilter {
  from?: Date;
  to?: Date;
  type?: PerfumeType;
}
