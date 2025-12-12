import express from 'express';
import cors from 'cors';
import "reflect-metadata";
import { initialize_database } from './Database/InitializeConnection';
import dotenv from 'dotenv';
import { Repository } from 'typeorm';
import { User } from './Domain/models/User';
import { Db } from './Database/DbConnectionPool';
import { seedInitialUsers } from './Database/SeedUsers';
import { IUsersService } from './Domain/services/IUsersService';
import { UsersService } from './Services/UsersService';
import { UsersController } from './WebAPI/controllers/UsersController';
import { ILogerService } from './Domain/services/ILogerService';
import { LogerService } from './Services/LogerService';
import { AuditLogClient } from './Services/AuditLogClient';
import { requireServiceKey } from './WebAPI/middlewares/ServiceAuthMiddleware';
import { ReportController } from './WebAPI/controllers/ReportController';

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

// Dozvoljava pristup samo gateway-u (API key)
app.use(requireServiceKey);

// Services (initialized after DB is ready)
const auditLogClient = new AuditLogClient();
const logerService: ILogerService = new LogerService();

// Hold references that will be set once the DB is connected
let userRepository: Repository<User>;
let userService: IUsersService;
let userController: UsersController;
let reportController: ReportController;

initialize_database()
  .then(async () => {
    userRepository = Db.getRepository(User);
    userService = new UsersService(userRepository, auditLogClient);
    userController = new UsersController(userService, logerService, auditLogClient);
    reportController = new ReportController(userService, auditLogClient);

    await seedInitialUsers(userRepository);

    // Register routes only after initialization to avoid using uninitialized repo
    app.use('/api/v1', userController.getRouter());
    app.use('/api/v1', reportController.getRouter());
  })
  .catch((err) => {
    console.error("\x1b[31m[DbSeed@users]\x1b[0m Seeding failed", err);
  });

export default app;
