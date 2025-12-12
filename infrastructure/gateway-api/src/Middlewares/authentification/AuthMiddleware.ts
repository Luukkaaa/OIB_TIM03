import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthTokenClaimsType } from "../../Domain/types/AuthTokenClaims";
import { AuditLogClient } from "../../Services/AuditLogClient";
import { LogType } from "../../Domain/enums/LogType";

const auditClient = new AuditLogClient();

declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenClaimsType;
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    void auditClient.log(LogType.WARNING, "Autentifikacija neuspesna: nedostaje JWT token");
    res.status(401).json({ success: false, message: "Token is missing!" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET ?? ""
    ) as AuthTokenClaimsType;

    req.user = decoded;
    void auditClient.log(
      LogType.INFO,
      `Autentifikacija uspesna za korisnika ${decoded.username ?? decoded.id ?? "unknown"}`
    );
    next();
  } catch (err) {
    void auditClient.log(LogType.WARNING, "Autentifikacija neuspesna: neispravan JWT token");
    res.status(401).json({ success: false, message: "Invalid token provided!" });
  }
};
