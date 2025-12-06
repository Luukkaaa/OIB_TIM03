import { CreateWarehouseDTO } from "../DTOs/CreateWarehouseDTO";
import { UpdateWarehouseDTO } from "../DTOs/UpdateWarehouseDTO";
import { Warehouse } from "../models/Warehouse";

export interface IWarehouseService {
  create(data: CreateWarehouseDTO): Promise<Warehouse>;
  update(id: number, data: UpdateWarehouseDTO): Promise<Warehouse>;
  delete(id: number): Promise<void>;
  getById(id: number): Promise<Warehouse>;
  getAll(): Promise<Warehouse[]>;
  search(query: string): Promise<Warehouse[]>;
}
