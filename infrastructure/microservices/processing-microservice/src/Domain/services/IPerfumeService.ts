import { CreatePerfumeDTO } from "../DTOs/CreatePerfumeDTO";
import { UpdatePerfumeDTO } from "../DTOs/UpdatePerfumeDTO";
import { Perfume } from "../models/Perfume";

export interface IPerfumeService {
  create(data: CreatePerfumeDTO): Promise<Perfume>;
  update(id: number, data: UpdatePerfumeDTO): Promise<Perfume>;
  delete(id: number): Promise<void>;
  getById(id: number): Promise<Perfume>;
  getAll(): Promise<Perfume[]>;
  search(query: string): Promise<Perfume[]>;
}
