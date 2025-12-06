import { SaleDTO } from "../../models/sales/SaleDTO";

export interface ISaleAPI {
  getAllSales(token: string): Promise<SaleDTO[]>;
  searchSales(token: string, query: string): Promise<SaleDTO[]>;
}
