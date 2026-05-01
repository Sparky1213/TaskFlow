import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../prisma";
import { signToken } from "../utils/token";
import { requireAuth } from "../middleware/auth";
import { AuthRequest } from "../types";
import { validate } from "../middleware/validation";

const router = Router();

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

router.post("/signup", validate(signupSchema), async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ message: "Email already in use." });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email, passwordHash },
  });

  const token = signToken({ userId: user.id, email: user.email });
  return res.status(201).json({ token, user: { id: user.id, name, email } });
});

router.post("/login", validate(loginSchema), async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  const token = signToken({ userId: user.id, email: user.email });
  return res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email },
  });
});

router.get("/me", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user!.userId;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  return res.json(user);
});

const updateProfileSchema = z.object({
  name: z.string().min(2),
});

router.patch("/me", requireAuth, validate(updateProfileSchema), async (req: AuthRequest, res) => {
  const userId = req.user!.userId;
  const { name } = req.body;

  const user = await prisma.user.update({
    where: { id: userId },
    data: { name },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  return res.json(user);
});

export default router;
