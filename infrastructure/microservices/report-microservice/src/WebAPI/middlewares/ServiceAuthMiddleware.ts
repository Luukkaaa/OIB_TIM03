import { NextFunction, Request, Response } from "express";

export const requireServiceKey = (req: Request, res: Response, next: NextFunction): void => {
  const expected = process.env.SERVICE_API_KEY || "dev-gateway-key";
  const provided = req.header("x-service-key");

  if (!provided || provided !== expected) {
    res.status(401).json({ success: false, message: "Unauthorized microservice call" });
    return;
  }

  next();
};
