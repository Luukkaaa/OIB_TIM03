import express from "express";
import cors from "cors";
import "reflect-metadata";
import dotenv from "dotenv";
import { initialize_database } from "./database/InitializeConnection";
import { Db } from "./database/DbConnectionPool";
import { AuditLog } from "./domain/models/AuditLog";
import { Repository } from "typeorm";
import { AuditService } from "./services/AuditService";
import { AuditController } from "./webapi/controllers/AuditController";
import { authenticate } from "./webapi/middlewares/AuthMiddleware";
import { requireServiceKey } from "./webapi/middlewares/ServiceAuthMiddleware";

dotenv.config({ quiet: true });

const app = express();

const corsOrigin = process.env.CORS_ORIGIN ?? "*";
const corsMethods = process.env.CORS_METHODS?.split(",").map((m) => m.trim()) ?? ["GET", "POST", "PUT", "DELETE"];

app.use(
  cors({
    origin: corsOrigin,
    methods: corsMethods,
  })
);

app.use(express.json());

initialize_database();

// Dozvoli iskljucivo gateway-u pristup mikroservisu
app.use(requireServiceKey);

const auditRepository: Repository<AuditLog> = Db.getRepository(AuditLog);
const auditService = new AuditService(auditRepository);
const auditController = new AuditController(auditService);

app.use("/api/v1", authenticate, auditController.getRouter());

export default app;
