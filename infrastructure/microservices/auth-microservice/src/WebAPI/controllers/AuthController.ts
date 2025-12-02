import { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import { IAuthService } from "../../Domain/services/IAuthService";
import { LoginUserDTO } from "../../Domain/DTOs/LoginUserDTO";
import { RegistrationUserDTO } from "../../Domain/DTOs/RegistrationUserDTO";
import { validateLoginData } from "../validators/LoginValidator";
import { validateRegistrationData } from "../validators/RegisterValidator";
import { ILogerService } from "../../Domain/services/ILogerService";
import { AuditLogClient } from "../../Services/AuditLogClient";
import { LogType } from "../../audit-types/LogType";

export class AuthController {
  private router: Router;
  private authService: IAuthService;
  private readonly logerService: ILogerService;
  private readonly auditClient: AuditLogClient;

  constructor(authService: IAuthService, logerService: ILogerService, auditClient: AuditLogClient) {
    this.router = Router();
    this.authService = authService;
    this.logerService = logerService;
    this.auditClient = auditClient;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post("/auth/login", this.login.bind(this));
    this.router.post("/auth/register", this.register.bind(this));
    this.router.post("/auth/logout", this.logout.bind(this));
  }

  /**
   * POST /api/v1/auth/login
   * Authenticates a userData?
   */
  private async login(req: Request, res: Response): Promise<void> {
    try {
      this.logerService.log("Login request received");

      const data: LoginUserDTO = req.body as LoginUserDTO;

      // Validate login input
      const validation = validateLoginData(data);
      if (!validation.success) {
        await this.auditClient.log(LogType.ERROR, `Prijava odbijena: ${validation.message}`);
        res.status(400).json({ success: false, message: validation.message });
        return;
      }

      const result = await this.authService.login(data);

      if (result.authenificated) {
        const token = jwt.sign(
          { id: result.userData?.id, username: result.userData?.username, role: result.userData?.role },
          process.env.JWT_SECRET ?? "",
          { expiresIn: "6h" }
        );

        res.status(200).json({ success: true, token });
      } else {
        res.status(401).json({ success: false, message: "Invalid credentials!" });
      }
    } catch (error) {
      this.logerService.log(error as string);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  /**
   * POST /api/v1/auth/logout
   * Logs user logout event (id/username/role from JWT if provided)
   */
  private async logout(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      const secret = process.env.JWT_SECRET ?? "";

      if (authHeader && authHeader.startsWith("Bearer ")) {
        try {
          const token = authHeader.split(" ")[1];
          const decoded = jwt.verify(token, secret) as { username?: string; id?: number; role?: string };
          const who = decoded.username ?? `user:${decoded.id ?? "unknown"}`;
          await this.auditClient.log(LogType.INFO, `Korisnik ${who} se odjavio`);
        } catch {
          await this.auditClient.log(LogType.WARNING, "Odjava neuspesna: neispravan token");
        }
      } else {
        await this.auditClient.log(LogType.INFO, "Odjava pozvana bez tokena");
      }

      res.status(200).json({ success: true, message: "Logged out" });
    } catch (error) {
      this.logerService.log(error as string);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  /**
   * POST /api/v1/auth/register
   * Registers a new userData?
   */
  private async register(req: Request, res: Response): Promise<void> {
    try {
      this.logerService.log("Registration request received");

      const data: RegistrationUserDTO = req.body as RegistrationUserDTO;

      // Validate registration input
      const validation = validateRegistrationData(data);
      if (!validation.success) {
        await this.auditClient.log(LogType.ERROR, `Registracija odbijena: ${validation.message}`);
        res.status(400).json({ success: false, message: validation.message });
        return;
      }

      const result = await this.authService.register(data);

      if (result.authenificated) {
        const token = jwt.sign(
          { id: result.userData?.id, username: result.userData?.username, role: result.userData?.role },
          process.env.JWT_SECRET ?? "",
          { expiresIn: "6h" }
        );

        res.status(201).json({ success: true, message: "Registration successful", token });
      } else {
        res.status(400).json({
          success: false,
          message: "Registration failed. Username or email may already exist.",
        });
      }
    } catch (error) {
      this.logerService.log(error as string);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}
