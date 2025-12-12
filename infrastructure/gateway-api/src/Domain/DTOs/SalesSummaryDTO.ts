import { PaymentMethod } from "../enums/PaymentMethod";
import { SaleType } from "../enums/SaleType";

export interface SalesSummaryDTO {
  from?: string;
  to?: string;
  totalCount: number;
  totalAmount: number;
  averageAmount: number;
  byPaymentMethod: Array<{ paymentMethod: PaymentMethod; totalAmount: number; count: number; averageAmount: number }>;
  bySaleType: Array<{ saleType: SaleType; totalAmount: number; count: number; averageAmount: number }>;
}
