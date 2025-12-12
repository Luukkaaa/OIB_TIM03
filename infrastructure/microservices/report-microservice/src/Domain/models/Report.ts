import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ReportType } from "../enums/ReportType";
import { ReportStatus } from "../enums/ReportStatus";

@Entity("reports")
export class Report {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 150 })
  title!: string;

  @Column({ type: "enum", enum: ReportType })
  type!: ReportType;

  @Column({ type: "enum", enum: ReportStatus, default: ReportStatus.PENDING })
  status!: ReportStatus;

  @Column({ type: "longtext", nullable: true })
  filters!: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  filePath!: string | null;

  @Column({ type: "varchar", length: 100, default: "csv" })
  format!: string;

  @Column({ type: "datetime", nullable: true })
  lastRunAt!: Date | null;

  @Column({ type: "varchar", length: 500, nullable: true })
  errorMessage!: string | null;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;
}
