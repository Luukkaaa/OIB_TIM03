import { PackagingStatus } from "../enums/PackagingStatus";

export interface UpdatePackagingDTO {
  name?: string;
  senderAddress?: string;
  warehouseId?: number;
  perfumeIds?: number[];
  status?: PackagingStatus;
}
