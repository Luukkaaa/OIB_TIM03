import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("warehouses")
export class Warehouse {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 150 })
  name!: string;

  @Column({ type: "varchar", length: 200 })
  location!: string;

  @Column({ type: "int" })
  capacity!: number; // maksimalan broj ambalaža

  // opciono: lista ID ambalaža u JSON-u
  @Column({ type: "simple-json", nullable: true })
  packagingIds?: number[];

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;
}
