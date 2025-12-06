import { CreateSaleDTO } from "../DTOs/CreateSaleDTO";
import { UpdateSaleDTO } from "../DTOs/UpdateSaleDTO";
import { Sale } from "../models/Sale";

export interface ISaleService {
  create(data: CreateSaleDTO): Promise<Sale>;
  update(id: number, data: UpdateSaleDTO): Promise<Sale>;
  delete(id: number): Promise<void>;
  getById(id: number): Promise<Sale>;
  getAll(): Promise<Sale[]>;
  search(query: string): Promise<Sale[]>;
}
