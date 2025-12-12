import express from 'express';
import cors from 'cors';
import "reflect-metadata";
import { initialize_database } from './Database/InitializeConnection';
import dotenv from 'dotenv';
import { Repository } from 'typeorm';
import { User } from './Domain/models/User';
import { Db } from './Database/DbConnectionPool';
import { seedInitialUsers } from './Database/SeedUsers';
import { IAuthService } from './Domain/services/IAuthService';
import { AuthService } from './Services/AuthService';
import { AuthController } from './WebAPI/controllers/AuthController';
import { ILogerService } from './Domain/services/ILogerService';
import { LogerService } from './Services/LogerService';
import { AuditLogClient } from './Services/AuditLogClient';
import { requireServiceKey } from './WebAPI/middlewares/ServiceAuthMiddleware';

dotenv.config({ quiet: true });

const app = express();

// Read CORS settings from environment
const corsOrigin = process.env.CORS_ORIGIN;
const corsMethods = process.env.CORS_METHODS?.split(",").map(m => m.trim());

if (!corsOrigin || !corsMethods) {
  throw new Error("CORS_ORIGIN i CORS_METHODS moraju biti definisani u .env za auth-microservice");
}

// Protected microservice from unauthorized access
app.use(cors({
  origin: corsOrigin,
  methods: corsMethods,
}));

app.use(express.json());

// Dozvoljava pristup samo gateway-u (API key)
app.use(requireServiceKey);

// ORM Repositories
const userRepository: Repository<User> = Db.getRepository(User);

// Services
const auditLogClient = new AuditLogClient();
const authService: IAuthService = new AuthService(userRepository, auditLogClient);
const logerService: ILogerService = new LogerService();

initialize_database()
  .then(async () => {
    await seedInitialUsers(userRepository);
  })
  .catch((err) => {
    console.error("\x1b[31m[DbSeed@users]\x1b[0m Seeding failed", err);
  });

// WebAPI routes
const authController = new AuthController(authService, logerService, auditLogClient);

// Registering routes
app.use('/api/v1', authController.getRouter());

export default app;
