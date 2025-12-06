import { PackagingStatus } from "../enums/PackagingStatus";

export interface CreatePackagingDTO {
  name: string;
  senderAddress: string;
  warehouseId: number;
  perfumeIds: number[];
  status?: PackagingStatus;
}
