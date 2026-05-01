import { NextFunction, Response } from "express";
import { ProjectRole } from "@prisma/client";
import { prisma } from "../prisma";
import { AuthRequest } from "../types";

export const requireProjectMember = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const projectIdRaw = req.params.id || req.params.projectId;
  const projectId = Array.isArray(projectIdRaw) ? projectIdRaw[0] : projectIdRaw;
  const userId = req.user?.userId;

  if (!projectId || !userId) {
    return res.status(400).json({ message: "Project and user are required." });
  }

  const membership = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
  });

  if (!membership) {
    return res.status(403).json({ message: "Project membership required." });
  }

  return next();
};

export const requireProjectAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const projectIdRaw = req.params.id || req.params.projectId;
  const projectId = Array.isArray(projectIdRaw) ? projectIdRaw[0] : projectIdRaw;
  const userId = req.user?.userId;

  if (!projectId || !userId) {
    return res.status(400).json({ message: "Project and user are required." });
  }

  const membership = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
  });

  if (!membership || membership.roleInProject !== ProjectRole.admin) {
    return res.status(403).json({ message: "Project admin access required." });
  }

  return next();
};
