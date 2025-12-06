export interface WarehouseDTO {
  id: number;
  name: string;
  location: string;
  capacity: number;
  packagingIds?: number[];
  createdAt: string;
  updatedAt: string;
}
