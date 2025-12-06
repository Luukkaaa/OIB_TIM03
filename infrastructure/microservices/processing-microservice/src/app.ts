import express from "express";
import cors from "cors";
import "reflect-metadata";
import dotenv from "dotenv";
import { Repository } from "typeorm";
import { initialize_database } from "./Database/InitializeConnection";
import { Db } from "./Database/DbConnectionPool";
import { Perfume } from "./Domain/models/Perfume";
import { AuditLogClient } from "./Services/AuditLogClient";
import { requireServiceKey } from "./WebAPI/middlewares/ServiceAuthMiddleware";
import { authenticate } from "./WebAPI/middlewares/AuthMiddleware";
import { IPerfumeService } from "./Domain/services/IPerfumeService";
import { PerfumeService } from "./Services/PerfumeService";
import { PerfumeController } from "./WebAPI/controllers/PerfumeController";

dotenv.config({ quiet: true });

const app = express();

const corsOrigin = process.env.CORS_ORIGIN;
const corsMethods = process.env.CORS_METHODS?.split(",").map((m) => m.trim());

if (!corsOrigin || !corsMethods) {
  throw new Error("CORS_ORIGIN i CORS_METHODS moraju biti definisani u .env za processing-microservice");
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
const perfumeRepository: Repository<Perfume> = Db.getRepository(Perfume);

// Services
const auditLogClient = new AuditLogClient();
const perfumeService: IPerfumeService = new PerfumeService(perfumeRepository, auditLogClient);

// Controllers
const perfumeController = new PerfumeController(perfumeService, auditLogClient);

// Routes (JWT guard for roles)
app.use("/api/v1", authenticate, perfumeController.getRouter());

export default app;
