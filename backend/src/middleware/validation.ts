import { NextFunction, Request, Response } from "express";
import { z } from "zod";

export const validate =
  (schema: z.ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    req.body = parsed.data;
    return next();
  };
