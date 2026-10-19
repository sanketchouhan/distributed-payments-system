import { NextFunction, Request, Response } from "express";

export const genericErrorHandler = (
  _err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
};
