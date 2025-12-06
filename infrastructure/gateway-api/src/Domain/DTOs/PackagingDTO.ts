import { PackagingStatus } from "../enums/PackagingStatus";

export interface PackagingDTO {
  id: number;
  name: string;
  senderAddress: string;
  warehouseId: number;
  perfumeIds: number[];
  status: PackagingStatus;
  createdAt: string;
  updatedAt: string;
}
