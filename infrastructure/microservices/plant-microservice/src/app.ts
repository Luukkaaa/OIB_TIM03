import express from "express";
import cors from "cors";
import "reflect-metadata";
import dotenv from "dotenv";
import { Repository } from "typeorm";
import { initialize_database } from "./Database/InitializeConnection";
import { Db } from "./Database/DbConnectionPool";
import { Plant } from "./Domain/models/Plant";
import { IPlantService } from "./Domain/services/IPlantService";
import { PlantService } from "./Services/PlantService";
import { PlantController } from "./WebAPI/controllers/PlantController";
import { ReportController } from "./WebAPI/controllers/ReportController";
import { AuditLogClient } from "./Services/AuditLogClient";
import { requireServiceKey } from "./WebAPI/middlewares/ServiceAuthMiddleware";
import { authenticate } from "./WebAPI/middlewares/AuthMiddleware";

dotenv.config({ quiet: true });

const app = express();

const corsOrigin = process.env.CORS_ORIGIN;
const corsMethods = process.env.CORS_METHODS?.split(",").map((m) => m.trim());

if (!corsOrigin || !corsMethods) {
  throw new Error("CORS_ORIGIN i CORS_METHODS moraju biti definisani u .env za plant-microservice");
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
const plantRepository: Repository<Plant> = Db.getRepository(Plant);

// Services
const auditLogClient = new AuditLogClient();
const plantService: IPlantService = new PlantService(plantRepository, auditLogClient);

// Controllers
const plantController = new PlantController(plantService, auditLogClient);
const reportController = new ReportController(plantService, auditLogClient);

// Routes (JWT guard for roles)
app.use("/api/v1", authenticate, plantController.getRouter());
app.use("/api/v1", authenticate, reportController.getRouter());

export default app;
