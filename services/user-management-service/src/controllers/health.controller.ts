import { Request, Response } from "express";

export async function healthController(
  _req: Request,
  res: Response,
): Promise<void> {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
}
