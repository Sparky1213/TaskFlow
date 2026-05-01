import { NextFunction, Response } from "express";
import { AuthRequest } from "../types";
import { verifyToken } from "../utils/token";

export const requireAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid token." });
  }

  try {
    const token = authHeader.replace("Bearer ", "");
    req.user = verifyToken(token);
    return next();
  } catch {
    return res.status(401).json({ message: "Token verification failed." });
  }
};
