import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  // Ako je prosao service-key (gateway), dozvoli dalje – servisno poverenje.
  const expectedServiceKey = process.env.SERVICE_API_KEY;
  const providedServiceKey = req.header("x-service-key");
  if (expectedServiceKey && providedServiceKey && expectedServiceKey === providedServiceKey) {
    next();
    return;
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ success: false, message: "Token is missing!" });
    return;
  }

  const token = authHeader.split(" ")[1] || "";

  try {
    const secret = process.env.JWT_SECRET || "";
    const decoded = jwt.verify(token, secret) as { role?: string };

    if (!decoded.role || decoded.role.toLowerCase() !== "admin") {
      res.status(403).json({ success: false, message: "Admin role required" });
      return;
    }

    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid token provided!" });
  }
};
