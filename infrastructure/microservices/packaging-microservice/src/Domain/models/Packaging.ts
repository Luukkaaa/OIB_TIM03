import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { PackagingStatus } from "../enums/PackagingStatus";

@Entity("packagings")
export class Packaging {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 150 })
  name!: string;

  @Column({ type: "varchar", length: 200 })
  senderAddress!: string;

  @Column({ type: "int" })
  warehouseId!: number;

  // JSON lista ID-ева parfema
  @Column({ type: "simple-json" })
  perfumeIds!: number[];

  @Column({ type: "enum", enum: PackagingStatus, default: PackagingStatus.SPAKOVANA })
  status!: PackagingStatus;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;
}
