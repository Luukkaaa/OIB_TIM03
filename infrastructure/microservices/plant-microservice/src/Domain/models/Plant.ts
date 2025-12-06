import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { PlantState } from "../enums/PlantState";

@Entity("plants")
export class Plant {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 150 })
  commonName!: string;

  @Column({ type: "varchar", length: 150 })
  latinName!: string;

  @Column({ type: "varchar", length: 120 })
  originCountry!: string;

  @Column({ type: "decimal", precision: 2, scale: 1 })
  oilStrength!: number;

  @Column({ type: "int", default: 1 })
  quantity!: number;

  @Column({ type: "enum", enum: PlantState })
  state!: PlantState;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;
}
