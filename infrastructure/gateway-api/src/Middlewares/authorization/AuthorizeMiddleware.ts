import { Request, Response, NextFunction } from "express";
import { AuditLogClient } from "../../Services/AuditLogClient";
import { LogType } from "../../Domain/enums/LogType";

const auditClient = new AuditLogClient();

export const authorize = (...dozvoljeneUloge: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user || !dozvoljeneUloge.includes(user.role.toLowerCase())) {
      void auditClient.log(
        LogType.WARNING,
        `Zabranjen pristup za korisnika ${user?.username ?? "unknown"} na rutu ${req.originalUrl}`
      );
      res.status(403).json({ message: "Access denied" });
      return;
    }

    void auditClient.log(
      LogType.INFO,
      `Ovlastenje uspesno: ${user.username ?? user.id} -> ${req.method} ${req.originalUrl}`
    );
    next();
  };
};
