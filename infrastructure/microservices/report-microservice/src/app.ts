import express from "express";
import cors from "cors";
import "reflect-metadata";
import dotenv from "dotenv";
import { Repository } from "typeorm";
import { initialize_database } from "./Database/InitializeConnection";
import { Db } from "./Database/DbConnectionPool";
import { Report } from "./Domain/models/Report";
import { IReportService } from "./Domain/services/IReportService";
import { ReportService } from "./Services/ReportService";
import { ReportController } from "./WebAPI/controllers/ReportController";
import { SummaryClient } from "./Services/SummaryClient";
import { AuditLogClient } from "./Services/AuditLogClient";
import { requireServiceKey } from "./WebAPI/middlewares/ServiceAuthMiddleware";
import { authenticate } from "./WebAPI/middlewares/AuthMiddleware";

dotenv.config({ quiet: true });

const app = express();

const corsOrigin = process.env.CORS_ORIGIN;
const corsMethods = process.env.CORS_METHODS?.split(",").map((m) => m.trim());

if (!corsOrigin || !corsMethods) {
  throw new Error("CORS_ORIGIN i CORS_METHODS moraju biti definisani u .env za report-microservice");
}

app.use(
  cors({
    origin: corsOrigin,
    methods: corsMethods,
  })
);

app.use(express.json());

initialize_database();

// Dozvoli samo gateway-u ili ovlascenim servisima
app.use(requireServiceKey);

// ORM repos
const reportRepository: Repository<Report> = Db.getRepository(Report);

// Services
const auditLogClient = new AuditLogClient();
const summaryClient = new SummaryClient();
const reportService: IReportService = new ReportService(reportRepository, summaryClient, auditLogClient);

// Controllers
const reportController = new ReportController(reportService, auditLogClient);

// Routes (JWT guard for admin)
app.use("/api/v1", authenticate, reportController.getRouter());

export default app;
