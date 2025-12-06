import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { Perfume } from "../Domain/models/Perfume";

dotenv.config();

export const Db = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  username: process.env.DB_USER || "",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "prerada",
  ssl: { rejectUnauthorized: false },
  synchronize: true,
  logging: false,
  entities: [Perfume],
});
