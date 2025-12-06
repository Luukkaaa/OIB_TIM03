export interface CreateWarehouseDTO {
  name: string;
  location: string;
  capacity: number;
  packagingIds?: number[];
}
