import { Request, Response, Router } from "express";
import { IGatewayService } from "../Domain/services/IGatewayService";
import { LoginUserDTO } from "../Domain/DTOs/LoginUserDTO";
import { RegistrationUserDTO } from "../Domain/DTOs/RegistrationUserDTO";
import { authenticate } from "../Middlewares/authentification/AuthMiddleware";
import { authorize } from "../Middlewares/authorization/AuthorizeMiddleware";
import { CreateUserDTO } from "../Domain/DTOs/CreateUserDTO";
import { UpdateUserDTO } from "../Domain/DTOs/UpdateUserDTO";
import { CreateAuditLogDTO } from "../Domain/DTOs/CreateAuditLogDTO";
import { UpdateAuditLogDTO } from "../Domain/DTOs/UpdateAuditLogDTO";
import { CreatePlantDTO } from "../Domain/DTOs/CreatePlantDTO";
import { UpdatePlantDTO } from "../Domain/DTOs/UpdatePlantDTO";

export class GatewayController {
  private readonly router: Router;

  constructor(private readonly gatewayService: IGatewayService) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Auth
    this.router.post("/login", this.login.bind(this));
    this.router.post("/register", this.register.bind(this));
    this.router.post("/logout", authenticate, this.logout.bind(this));

    // Users
    this.router.get("/users", authenticate, authorize("admin"), this.getAllUsers.bind(this));
    this.router.get("/users/search/:query", authenticate, authorize("admin"), this.searchUsers.bind(this));
    this.router.get("/users/:id", authenticate, authorize("admin", "seller", "sales_manager"), this.getUserById.bind(this));
    this.router.post("/users", authenticate, authorize("admin"), this.createUser.bind(this));
    this.router.put("/users/:id", authenticate, authorize("admin"), this.updateUser.bind(this));
    this.router.delete("/users/:id", authenticate, authorize("admin"), this.deleteUser.bind(this));

    // Audit logs (admin only)
    this.router.get("/logs", authenticate, authorize("admin"), this.getAllLogs.bind(this));
    this.router.get("/logs/search/:q", authenticate, authorize("admin"), this.searchLogs.bind(this));
    this.router.get("/logs/:id", authenticate, authorize("admin"), this.getLogById.bind(this));
    this.router.post("/logs", authenticate, authorize("admin"), this.createLog.bind(this));
    this.router.put("/logs/:id", authenticate, authorize("admin"), this.updateLog.bind(this));
    this.router.delete("/logs/:id", authenticate, authorize("admin"), this.deleteLog.bind(this));

    // Plants: read svi (uključujući seller), write admin + sales_manager
    this.router.get("/plants", authenticate, authorize("admin", "sales_manager", "seller"), this.getAllPlants.bind(this));
    this.router.get("/plants/search/:q", authenticate, authorize("admin", "sales_manager", "seller"), this.searchPlants.bind(this));
    this.router.get("/plants/:id", authenticate, authorize("admin", "sales_manager", "seller"), this.getPlantById.bind(this));
    this.router.post("/plants", authenticate, authorize("admin", "sales_manager"), this.createPlant.bind(this));
    this.router.put("/plants/:id", authenticate, authorize("admin", "sales_manager"), this.updatePlant.bind(this));
    this.router.delete("/plants/:id", authenticate, authorize("admin", "sales_manager"), this.deletePlant.bind(this));
  }

  // Auth
  private async login(req: Request, res: Response): Promise<void> {
    const data: LoginUserDTO = req.body;
    const result = await this.gatewayService.login(data);
    res.status(200).json(result);
  }

  private async register(req: Request, res: Response): Promise<void> {
    const data: RegistrationUserDTO = req.body;
    const result = await this.gatewayService.register(data);
    res.status(200).json(result);
  }

  private async logout(req: Request, res: Response): Promise<void> {
    try {
      const token = req.headers.authorization ?? "";
      const result = await this.gatewayService.logout(token);
      res.status(200).json(result);
    } catch (err) {
      res.status(400).json({ message: (err as Error).message });
    }
  }

  // Users
  private async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await this.gatewayService.getAllUsers();
      res.status(200).json(users);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (!req.user || (req.user.id !== id && req.user.role.toLowerCase() !== "admin")) {
        res.status(401).json({ message: "You can only access your own data!" });
        return;
      }

      const user = await this.gatewayService.getUserById(id);
      res.status(200).json(user);
    } catch (err) {
      res.status(404).json({ message: (err as Error).message });
    }
  }

  private async createUser(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateUserDTO = req.body;
      const user = await this.gatewayService.createUser(data);
      res.status(201).json(user);
    } catch (err) {
      res.status(400).json({ message: (err as Error).message });
    }
  }

  private async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const data: UpdateUserDTO = req.body;
      const user = await this.gatewayService.updateUser(id, data);
      res.status(200).json(user);
    } catch (err) {
      res.status(400).json({ message: (err as Error).message });
    }
  }

  private async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      await this.gatewayService.deleteUser(id);
      res.status(204).send();
    } catch (err) {
      res.status(404).json({ message: (err as Error).message });
    }
  }

  private async searchUsers(req: Request, res: Response): Promise<void> {
    try {
      const query = req.params.query;
      const users = await this.gatewayService.searchUsers(query);
      res.status(200).json(users);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  public getRouter(): Router {
    return this.router;
  }

  // Audit logs
  private async getAllLogs(req: Request, res: Response): Promise<void> {
    try {
      const token = req.headers.authorization ?? "";
      const logs = await this.gatewayService.getAllLogs(token);
      res.status(200).json(logs);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getLogById(req: Request, res: Response): Promise<void> {
    try {
      const token = req.headers.authorization ?? "";
      const id = parseInt(req.params.id, 10);
      const log = await this.gatewayService.getLogById(token, id);
      res.status(200).json(log);
    } catch (err) {
      res.status(404).json({ message: (err as Error).message });
    }
  }

  private async createLog(req: Request, res: Response): Promise<void> {
    try {
      const token = req.headers.authorization ?? "";
      const data = req.body as CreateAuditLogDTO;
      const created = await this.gatewayService.createLog(token, data);
      res.status(201).json(created);
    } catch (err) {
      res.status(400).json({ message: (err as Error).message });
    }
  }

  private async updateLog(req: Request, res: Response): Promise<void> {
    try {
      const token = req.headers.authorization ?? "";
      const id = parseInt(req.params.id, 10);
      const data = req.body as UpdateAuditLogDTO;
      const updated = await this.gatewayService.updateLog(token, id, data);
      res.status(200).json(updated);
    } catch (err) {
      res.status(400).json({ message: (err as Error).message });
    }
  }

  private async deleteLog(req: Request, res: Response): Promise<void> {
    try {
      const token = req.headers.authorization ?? "";
      const id = parseInt(req.params.id, 10);
      await this.gatewayService.deleteLog(token, id);
      res.status(204).send();
    } catch (err) {
      res.status(404).json({ message: (err as Error).message });
    }
  }

  private async searchLogs(req: Request, res: Response): Promise<void> {
    try {
      const token = req.headers.authorization ?? "";
      const q = req.params.q;
      const logs = await this.gatewayService.searchLogs(token, q);
      res.status(200).json(logs);
    } catch (err) {
      res.status(400).json({ message: (err as Error).message });
    }
  }

  // Plants
  private async getAllPlants(req: Request, res: Response): Promise<void> {
    try {
      const token = req.headers.authorization ?? "";
      const plants = await this.gatewayService.getAllPlants(token);
      res.status(200).json(plants);
    } catch (err: any) {
      const status = err?.response?.status ?? 500;
      const message = err?.response?.data?.message ?? (err as Error).message;
      res.status(status).json({ message });
    }
  }

  private async getPlantById(req: Request, res: Response): Promise<void> {
    try {
      const token = req.headers.authorization ?? "";
      const id = parseInt(req.params.id, 10);
      const plant = await this.gatewayService.getPlantById(token, id);
      res.status(200).json(plant);
    } catch (err: any) {
      const status = err?.response?.status ?? 404;
      const message = err?.response?.data?.message ?? (err as Error).message;
      res.status(status).json({ message });
    }
  }

  private async createPlant(req: Request, res: Response): Promise<void> {
    try {
      const token = req.headers.authorization ?? "";
      const data: CreatePlantDTO = req.body;
      const plant = await this.gatewayService.createPlant(token, data);
      res.status(201).json(plant);
    } catch (err: any) {
      const status = err?.response?.status ?? 400;
      const message = err?.response?.data?.message ?? (err as Error).message;
      res.status(status).json({ message });
    }
  }

  private async updatePlant(req: Request, res: Response): Promise<void> {
    try {
      const token = req.headers.authorization ?? "";
      const id = parseInt(req.params.id, 10);
      const data: UpdatePlantDTO = req.body;
      const plant = await this.gatewayService.updatePlant(token, id, data);
      res.status(200).json(plant);
    } catch (err: any) {
      const status = err?.response?.status ?? 400;
      const message = err?.response?.data?.message ?? (err as Error).message;
      res.status(status).json({ message });
    }
  }

  private async deletePlant(req: Request, res: Response): Promise<void> {
    try {
      const token = req.headers.authorization ?? "";
      const id = parseInt(req.params.id, 10);
      await this.gatewayService.deletePlant(token, id);
      res.status(204).send();
    } catch (err: any) {
      const status = err?.response?.status ?? 404;
      const message = err?.response?.data?.message ?? (err as Error).message;
      res.status(status).json({ message });
    }
  }

  private async searchPlants(req: Request, res: Response): Promise<void> {
    try {
      const token = req.headers.authorization ?? "";
      const q = req.params.q;
      const plants = await this.gatewayService.searchPlants(token, q);
      res.status(200).json(plants);
    } catch (err: any) {
      const status = err?.response?.status ?? 400;
      const message = err?.response?.data?.message ?? (err as Error).message;
      res.status(status).json({ message });
    }
  }
}
