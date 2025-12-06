import express from "express";
import cors from "cors";
import "reflect-metadata";
import dotenv from "dotenv";
import { Repository } from "typeorm";
import { initialize_database } from "./Database/InitializeConnection";
import { Db } from "./Database/DbConnectionPool";
import { Warehouse } from "./Domain/models/Warehouse";
import { IWarehouseService } from "./Domain/services/IWarehouseService";
import { WarehouseService } from "./Services/WarehouseService";
import { WarehouseController } from "./WebAPI/controllers/WarehouseController";
import { AuditLogClient } from "./Services/AuditLogClient";
import { requireServiceKey } from "./WebAPI/middlewares/ServiceAuthMiddleware";
import { authenticate } from "./WebAPI/middlewares/AuthMiddleware";

dotenv.config({ quiet: true });

const app = express();

const corsOrigin = process.env.CORS_ORIGIN;
const corsMethods = process.env.CORS_METHODS?.split(",").map((m) => m.trim());

if (!corsOrigin || !corsMethods) {
  throw new Error("CORS_ORIGIN i CORS_METHODS moraju biti definisani u .env za storage-microservice");
}

app.use(
  cors({
    origin: corsOrigin,
    methods: corsMethods,
  })
);

app.use(express.json());

initialize_database();

// Dozvoljava pristup samo gateway-u (API key)
app.use(requireServiceKey);

// ORM repos
const warehouseRepository: Repository<Warehouse> = Db.getRepository(Warehouse);

// Services
const auditLogClient = new AuditLogClient();
const warehouseService: IWarehouseService = new WarehouseService(warehouseRepository, auditLogClient);

// Controllers
const warehouseController = new WarehouseController(warehouseService, auditLogClient);

// Routes (JWT guard for roles)
app.use("/api/v1", authenticate, warehouseController.getRouter());

export default app;
