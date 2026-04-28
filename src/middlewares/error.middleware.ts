import { Request, Response, NextFunction } from "express";

// Global error handling middleware
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(400).json({
    success: false,
    error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred. Please try again.",
      },
  });
};