import { SaleType } from "../enums/SaleType";
import { PaymentMethod } from "../enums/PaymentMethod";
import { SaleItemDTO } from "./CreateSaleDTO";

export interface SaleDTO {
  id: number;
  saleType: SaleType;
  paymentMethod: PaymentMethod;
  items: SaleItemDTO[];
  totalAmount: number;
  receiptNumber: string;
  createdAt: string;
  updatedAt: string;
}
