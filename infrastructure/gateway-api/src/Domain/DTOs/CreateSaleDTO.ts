import { SaleType } from "../enums/SaleType";
import { PaymentMethod } from "../enums/PaymentMethod";

export interface SaleItemDTO {
  perfumeId: number;
  quantity: number;
  unitPrice: number;
}

export interface CreateSaleDTO {
  saleType: SaleType;
  paymentMethod: PaymentMethod;
  items: SaleItemDTO[];
  receiptNumber: string;
}
