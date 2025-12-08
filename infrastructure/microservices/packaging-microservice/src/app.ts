import express from "express";
import cors from "cors";
import "reflect-metadata";
import dotenv from "dotenv";
import { Repository } from "typeorm";
import { initialize_database } from "./Database/InitializeConnection";
import { Db } from "./Database/DbConnectionPool";
import { Packaging } from "./Domain/models/Packaging";
import { IPackagingService } from "./Domain/services/IPackagingService";
import { PackagingService } from "./Services/PackagingService";
import { PackagingController } from "./WebAPI/controllers/PackagingController";
import { AuditLogClient } from "./Services/AuditLogClient";
import { requireServiceKey } from "./WebAPI/middlewares/ServiceAuthMiddleware";
import { authenticate } from "./WebAPI/middlewares/AuthMiddleware";
import { ProcessingClient } from "./Services/ProcessingClient";

dotenv.config({ quiet: true });

const app = express();

const corsOrigin = process.env.CORS_ORIGIN;
const corsMethods = process.env.CORS_METHODS?.split(",").map((m) => m.trim());

if (!corsOrigin || !corsMethods) {
  throw new Error("CORS_ORIGIN i CORS_METHODS moraju biti definisani u .env za packaging-microservice");
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
const packagingRepository: Repository<Packaging> = Db.getRepository(Packaging);

// Services
const auditLogClient = new AuditLogClient();
const processingClient = new ProcessingClient();
const packagingService: IPackagingService = new PackagingService(packagingRepository, auditLogClient, processingClient);

// Controllers
const packagingController = new PackagingController(packagingService, auditLogClient);

// Routes (JWT guard for roles)
app.use("/api/v1", authenticate, packagingController.getRouter());

export default app;
