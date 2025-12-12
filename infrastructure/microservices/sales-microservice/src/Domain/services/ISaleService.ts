import { CreateSaleDTO } from "../DTOs/CreateSaleDTO";
import { UpdateSaleDTO } from "../DTOs/UpdateSaleDTO";
import { Sale } from "../models/Sale";
import { SalesReportFilter, SalesSummaryDTO } from "../DTOs/SalesSummaryDTO";

export interface ISaleService {
  create(data: CreateSaleDTO): Promise<Sale>;
  update(id: number, data: UpdateSaleDTO): Promise<Sale>;
  delete(id: number): Promise<void>;
  getById(id: number): Promise<Sale>;
  getAll(): Promise<Sale[]>;
  search(query: string): Promise<Sale[]>;
  getSummary(filter: SalesReportFilter): Promise<SalesSummaryDTO>;
  exportSummaryCSV(filter: SalesReportFilter): Promise<{ filename: string; contentType: string; content: string }>;
}
