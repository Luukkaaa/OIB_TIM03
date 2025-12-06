import { SaleType } from "../enums/SaleType";
import { PaymentMethod } from "../enums/PaymentMethod";
import { SaleItemDTO } from "./CreateSaleDTO";

export interface UpdateSaleDTO {
  saleType?: SaleType;
  paymentMethod?: PaymentMethod;
  items?: SaleItemDTO[];
  receiptNumber?: string;
}
