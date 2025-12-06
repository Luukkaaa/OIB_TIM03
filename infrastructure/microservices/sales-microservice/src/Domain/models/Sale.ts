import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { SaleType } from "../enums/SaleType";
import { PaymentMethod } from "../enums/PaymentMethod";

export interface SaleItem {
  perfumeId: number;
  quantity: number;
  unitPrice: number;
}

@Entity("sales")
export class Sale {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "enum", enum: SaleType })
  saleType!: SaleType;

  @Column({ type: "enum", enum: PaymentMethod })
  paymentMethod!: PaymentMethod;

  @Column({ type: "simple-json" })
  items!: SaleItem[];

  @Column({ type: "decimal", precision: 10, scale: 2 })
  totalAmount!: number;

  @Column({ type: "varchar", length: 50, unique: true })
  receiptNumber!: string; // opciono polje za fiskalni broj

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;
}
