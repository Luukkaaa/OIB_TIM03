import { Router, Request, Response } from "express";
import { ILogerService } from "../../Domain/services/ILogerService";
import { IUsersService } from "../../Domain/services/IUsersService";
import { CreateUserDTO } from "../../Domain/DTOs/CreateUserDTO";
import { UpdateUserDTO } from "../../Domain/DTOs/UpdateUserDTO";
import { validateCreateUser } from "../validators/CreateUserValidator";
import { validateUpdateUser } from "../validators/UpdateUserValidator";
import { AuditLogClient } from "../../Services/AuditLogClient";
import { LogType } from "../../audit-types/LogType";

export class UsersController {
  private readonly router: Router;

  constructor(
    private readonly usersService: IUsersService,
    private readonly logger: ILogerService,
    private readonly auditClient: AuditLogClient
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private async safeAuditLog(type: LogType, message: string): Promise<void> {
    try {
      await this.auditClient.log(type, message);
    } catch (err) {
      this.logger.log(`[AuditLogError] ${(err as Error).message}`);
    }
  }

  private initializeRoutes(): void {
    this.router.get("/users", this.getAllUsers.bind(this));
    this.router.get("/users/search/:query", this.searchUsers.bind(this));
    this.router.get("/users/:id", this.getUserById.bind(this));
    this.router.post("/users", this.createUser.bind(this));
    this.router.put("/users/:id", this.updateUser.bind(this));
    this.router.delete("/users/:id", this.deleteUser.bind(this));
  }

  private async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      this.logger.log("Fetching all users");
      const users = await this.usersService.getAllUsers();
      res.status(200).json(users);
    } catch (err) {
      this.logger.log((err as Error).message);
      await this.safeAuditLog(LogType.ERROR, `Greska pri dohvatanju svih korisnika: ${(err as Error).message}`);
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      this.logger.log(`Fetching user with ID ${id}`);
      const user = await this.usersService.getUserById(id);
      res.status(200).json(user);
    } catch (err) {
      this.logger.log((err as Error).message);
      await this.safeAuditLog(LogType.ERROR, `Greska pri dohvatanju korisnika: ${(err as Error).message}`);
      res.status(404).json({ message: (err as Error).message });
    }
  }

  private async createUser(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateUserDTO = req.body as CreateUserDTO;
      const validation = validateCreateUser(data);
      if (!validation.success) {
        await this.safeAuditLog(LogType.WARNING, `Nevalidan zahtev za kreiranje korisnika: ${validation.message}`);
        res.status(400).json({ message: validation.message });
        return;
      }

      const created = await this.usersService.createUser(data);
      res.status(201).json(created);
    } catch (err) {
      this.logger.log((err as Error).message);
      await this.safeAuditLog(LogType.ERROR, `Kreiranje korisnika neuspesno: ${(err as Error).message}`);
      res.status(400).json({ message: (err as Error).message });
    }
  }

  private async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const data: UpdateUserDTO = req.body as UpdateUserDTO;
      const validation = validateUpdateUser(data);
      if (!validation.success) {
        await this.safeAuditLog(LogType.WARNING, `Nevalidan zahtev za azuriranje korisnika ${req.params.id}: ${validation.message}`);
        res.status(400).json({ message: validation.message });
        return;
      }

      const updated = await this.usersService.updateUser(id, data);
      res.status(200).json(updated);
    } catch (err) {
      this.logger.log((err as Error).message);
      await this.safeAuditLog(LogType.ERROR, `Azuriranje korisnika neuspesno: ${(err as Error).message}`);
      res.status(400).json({ message: (err as Error).message });
    }
  }

  private async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      await this.usersService.deleteUser(id);
      res.status(204).send();
    } catch (err) {
      this.logger.log((err as Error).message);
      await this.safeAuditLog(LogType.ERROR, `Brisanje korisnika neuspesno: ${(err as Error).message}`);
      res.status(404).json({ message: (err as Error).message });
    }
  }

  private async searchUsers(req: Request, res: Response): Promise<void> {
    try {
      const query = req.params.query;
      if (!query || query.trim().length < 2) {
        await this.safeAuditLog(LogType.WARNING, "Nevalidan query za pretragu korisnika (manje od 2 karaktera)");
        res.status(400).json({ message: "Query must be at least 2 characters long" });
        return;
      }

      const users = await this.usersService.searchUsers(query.trim());
      res.status(200).json(users);
    } catch (err) {
      this.logger.log((err as Error).message);
      await this.safeAuditLog(LogType.ERROR, `Pretraga korisnika neuspesna: ${(err as Error).message}`);
      res.status(500).json({ message: (err as Error).message });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}
