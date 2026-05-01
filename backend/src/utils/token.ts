import jwt from "jsonwebtoken";
import { AuthPayload } from "../types";

const JWT_SECRET = process.env.JWT_SECRET || "unsafe-dev-secret";

export const signToken = (payload: AuthPayload) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

export const verifyToken = (token: string) =>
  jwt.verify(token, JWT_SECRET) as AuthPayload;
