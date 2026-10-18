import { Request, Response, NextFunction } from "express";
import { validate as uuidValidate } from "uuid";

export async function idempotencyMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const idempotencyKey =
    req.headers["Idempotency-Key"] || req.headers["idempotency-key"];

  if (
    !idempotencyKey ||
    typeof idempotencyKey !== "string" ||
    !uuidValidate(idempotencyKey)
  ) {
    res.status(400).json({ error: "Invalid idempotency key" });
    return;
  }
  req.idempotencyKey = idempotencyKey;
  next();
}
