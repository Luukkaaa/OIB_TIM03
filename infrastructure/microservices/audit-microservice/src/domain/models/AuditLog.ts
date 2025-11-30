import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";
import { LogType } from "../enums/LogType";

@Entity("audit_logs")
export class AuditLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "enum", enum: LogType })
  type!: LogType;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @Column({ type: "text" })
  description!: string;
}
