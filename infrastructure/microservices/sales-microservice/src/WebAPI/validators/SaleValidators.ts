import { CreateSaleDTO, SaleItemDTO } from "../../Domain/DTOs/CreateSaleDTO";
import { UpdateSaleDTO } from "../../Domain/DTOs/UpdateSaleDTO";
import { SaleType } from "../../Domain/enums/SaleType";
import { PaymentMethod } from "../../Domain/enums/PaymentMethod";

const isPositiveInt = (val: number | undefined) => val !== undefined && Number.isInteger(val) && val > 0;
const isPositiveNum = (val: number | undefined) => val !== undefined && !Number.isNaN(val) && val > 0;

const validateItems = (items: SaleItemDTO[] | undefined) => {
  if (!items || items.length === 0) return { success: false, message: "Mora postojati bar jedna stavka" };
  for (const item of items) {
    if (!isPositiveInt(item.perfumeId)) return { success: false, message: "perfumeId mora biti pozitivan ceo broj" };
    if (!isPositiveInt(item.quantity)) return { success: false, message: "Kolicina mora biti pozitivan ceo broj" };
    if (!isPositiveNum(item.unitPrice)) return { success: false, message: "Cena mora biti veca od 0" };
  }
  return { success: true };
};

function validateBase(data: Partial<CreateSaleDTO | UpdateSaleDTO>): { success: boolean; message?: string } {
  if (data.saleType !== undefined && !Object.values(SaleType).includes(data.saleType)) {
    return { success: false, message: "Nepoznat tip prodaje" };
  }
  if (data.paymentMethod !== undefined && !Object.values(PaymentMethod).includes(data.paymentMethod)) {
    return { success: false, message: "Nepoznat nacin placanja" };
  }
  if (data.items !== undefined) {
    const res = validateItems(data.items as any);
    if (!res.success) return res;
  }
  if (data.receiptNumber !== undefined && (!data.receiptNumber || data.receiptNumber.trim().length < 3)) {
    return { success: false, message: "Broj racuna mora imati bar 3 karaktera" };
  }
  return { success: true };
}

export function validateCreateSale(data: CreateSaleDTO): { success: boolean; message?: string } {
  if (!Object.values(SaleType).includes(data.saleType)) return { success: false, message: "Nepoznat tip prodaje" };
  if (!Object.values(PaymentMethod).includes(data.paymentMethod)) return { success: false, message: "Nepoznat nacin placanja" };
  const itemsRes = validateItems(data.items);
  if (!itemsRes.success) return itemsRes;
  if (!data.receiptNumber || data.receiptNumber.trim().length < 3) {
    return { success: false, message: "Broj racuna mora imati bar 3 karaktera" };
  }
  return validateBase(data);
}

export function validateUpdateSale(data: UpdateSaleDTO): { success: boolean; message?: string } {
  if (!data || Object.keys(data).length === 0) {
    return { success: false, message: "Nema podataka za izmenu" };
  }
  return validateBase(data);
}
