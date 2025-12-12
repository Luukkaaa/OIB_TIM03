import { PaymentMethod } from "../sales/PaymentMethod";
import { SaleType } from "../sales/SaleType";

export type SalesSummary = {
  from?: string;
  to?: string;
  totalCount: number;
  totalAmount: number;
  averageAmount: number;
  byPaymentMethod: Array<{
    paymentMethod: PaymentMethod;
    totalAmount: number;
    count: number;
    averageAmount: number;
  }>;
  bySaleType: Array<{
    saleType: SaleType;
    totalAmount: number;
    count: number;
    averageAmount: number;
  }>;
};
