import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const allowedRoles = ["admin", "sales_manager", "seller"];

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ success: false, message: "Token is missing!" });
    return;
  }

  const token = authHeader.split(" ")[1] || "";

  try {
    const secret = process.env.JWT_SECRET || "";
    const decoded = jwt.verify(token, secret) as { role?: string };

    if (!decoded.role || !allowedRoles.includes(decoded.role.toLowerCase())) {
      res.status(403).json({ success: false, message: "Insufficient role" });
      return;
    }

    next();
  } catch (err) {
    res.status(401).json({ success: false, message: "Invalid token provided!" });
  }
};
