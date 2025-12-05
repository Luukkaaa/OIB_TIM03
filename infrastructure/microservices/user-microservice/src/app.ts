import express from 'express';
import cors from 'cors';
import "reflect-metadata";
import { initialize_database } from './Database/InitializeConnection';
import dotenv from 'dotenv';
import { Repository } from 'typeorm';
import { User } from './Domain/models/User';
import { Db } from './Database/DbConnectionPool';
import { IUsersService } from './Domain/services/IUsersService';
import { UsersService } from './Services/UsersService';
import { UsersController } from './WebAPI/controllers/UsersController';
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
  throw new Error("CORS_ORIGIN i CORS_METHODS moraju biti definisani u .env za user-microservice");
}

// Protected microservice from unauthorized access
app.use(cors({
  origin: corsOrigin,
  methods: corsMethods,
}));

app.use(express.json());

initialize_database();

// Dozvoljava pristup samo gateway-u (API key)
app.use(requireServiceKey);

// ORM Repositories
const userRepository: Repository<User> = Db.getRepository(User);

// Services
const auditLogClient = new AuditLogClient();
const userService: IUsersService = new UsersService(userRepository, auditLogClient);
const logerService: ILogerService = new LogerService();

// WebAPI routes
const userController = new UsersController(userService, logerService, auditLogClient);

// Registering routes
app.use('/api/v1', userController.getRouter());

export default app;
