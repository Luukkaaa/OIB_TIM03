import { CreatePackagingDTO } from "../DTOs/CreatePackagingDTO";
import { UpdatePackagingDTO } from "../DTOs/UpdatePackagingDTO";
import { Packaging } from "../models/Packaging";

export interface IPackagingService {
  create(data: CreatePackagingDTO): Promise<Packaging>;
  update(id: number, data: UpdatePackagingDTO): Promise<Packaging>;
  delete(id: number): Promise<void>;
  getById(id: number): Promise<Packaging>;
  getAll(): Promise<Packaging[]>;
  search(query: string): Promise<Packaging[]>;
}
