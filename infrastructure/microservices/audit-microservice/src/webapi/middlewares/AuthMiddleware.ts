import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ success: false, message: "Token is missing!" });
    return;
  }

  const token = authHeader.split(" ")[1] || "";

  try {
    const secret = process.env.JWT_SECRET || "";
    jwt.verify(token, secret);
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: "Invalid token provided!" });
  }
};
