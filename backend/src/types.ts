import { Request } from "express";

export type AuthPayload = {
  userId: string;
  email: string;
};

export type AuthRequest = Request & {
  user?: AuthPayload;
};
