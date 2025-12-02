import { NextFunction, Request, Response } from "express";

/**
 * Osnovna servisna zastita: dozvoljava samo pozive koji nose tacan API kljuc iz env.
 * Time mikroservis prihvata saobracaj iskljucivo od gateway-a (ili drugog ovlascenog servisa).
 */
export const requireServiceKey = (req: Request, res: Response, next: NextFunction): void => {
  const expected = process.env.SERVICE_API_KEY;
  const provided = req.header("x-service-key");

  if (!expected || !provided || provided !== expected) {
    res.status(401).json({ success: false, message: "Unauthorized microservice call" });
    return;
  }

  next();
};
