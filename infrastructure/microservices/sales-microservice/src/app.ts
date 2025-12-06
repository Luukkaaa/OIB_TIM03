import express from "express";
import cors from "cors";
import "reflect-metadata";
import dotenv from "dotenv";
import { Repository } from "typeorm";
import { initialize_database } from "./Database/InitializeConnection";
import { Db } from "./Database/DbConnectionPool";
import { Sale } from "./Domain/models/Sale";
import { ISaleService } from "./Domain/services/ISaleService";
import { SaleService } from "./Services/SaleService";
import { SaleController } from "./WebAPI/controllers/SaleController";
import { AuditLogClient } from "./Services/AuditLogClient";
import { requireServiceKey } from "./WebAPI/middlewares/ServiceAuthMiddleware";
import { authenticate } from "./WebAPI/middlewares/AuthMiddleware";

dotenv.config({ quiet: true });

const app = express();

const corsOrigin = process.env.CORS_ORIGIN;
const corsMethods = process.env.CORS_METHODS?.split(",").map((m) => m.trim());

if (!corsOrigin || !corsMethods) {
  throw new Error("CORS_ORIGIN i CORS_METHODS moraju biti definisani u .env za sales-microservice");
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
const saleRepository: Repository<Sale> = Db.getRepository(Sale);

// Services
const auditLogClient = new AuditLogClient();
const saleService: ISaleService = new SaleService(saleRepository, auditLogClient);

// Controllers
const saleController = new SaleController(saleService, auditLogClient);

// Routes (JWT guard for roles)
app.use("/api/v1", authenticate, saleController.getRouter());

export default app;
