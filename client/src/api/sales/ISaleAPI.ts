import { SaleDTO } from "../../models/sales/SaleDTO";
import { SalesSummary } from "../../models/reports/SalesSummary";

export interface ISaleAPI {
  getAllSales(token: string): Promise<SaleDTO[]>;
  searchSales(token: string, query: string): Promise<SaleDTO[]>;
  getSalesSummary(
    token: string,
    params: { from?: string; to?: string; paymentMethod?: string; saleType?: string }
  ): Promise<SalesSummary>;
  exportSalesSummary(
    token: string,
    params: { from?: string; to?: string; paymentMethod?: string; saleType?: string; format?: string }
  ): Promise<{ blob: Blob; filename: string; contentType: string }>;
}
