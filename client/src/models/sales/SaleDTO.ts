import { SaleType } from "./SaleType";
import { PaymentMethod } from "./PaymentMethod";
import { SaleItemDTO } from "./SaleItemDTO";

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
