import { CreatePackagingDTO } from "../DTOs/CreatePackagingDTO";
import { UpdatePackagingDTO } from "../DTOs/UpdatePackagingDTO";
import { PackRequestDTO } from "../DTOs/PackRequestDTO";
import { SendRequestDTO } from "../DTOs/SendRequestDTO";
import { Packaging } from "../models/Packaging";

export interface IPackagingService {
  create(data: CreatePackagingDTO): Promise<Packaging>;
  update(id: number, data: UpdatePackagingDTO): Promise<Packaging>;
  delete(id: number): Promise<void>;
  getById(id: number): Promise<Packaging>;
  getAll(): Promise<Packaging[]>;
  search(query: string): Promise<Packaging[]>;
  pack(req: PackRequestDTO): Promise<Packaging[]>;
  send(req: SendRequestDTO): Promise<Packaging>;
}
