import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { PerfumeType } from "../enums/PerfumeType";

@Entity("perfumes")
export class Perfume {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 150 })
  name!: string;

  @Column({ type: "enum", enum: PerfumeType })
  type!: PerfumeType;

  @Column({ type: "int" })
  netQuantityMl!: number;

  @Column({ type: "varchar", length: 50, unique: true })
  serialNumber!: string;

  @Column({ type: "date" })
  expirationDate!: Date;

  @Column({ type: "int" })
  plantId!: number;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;
}
