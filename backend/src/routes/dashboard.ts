import { TaskStatus } from "@prisma/client";
import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { prisma } from "../prisma";
import { AuthRequest } from "../types";

const router = Router();
router.use(requireAuth);

router.get("/", async (req: AuthRequest, res) => {
  const userId = req.user!.userId;

  const memberships = await prisma.projectMember.findMany({
    where: { userId },
    select: { projectId: true },
  });
  const projectIds = memberships.map((m) => m.projectId);

  const tasks = await prisma.task.findMany({
    where: { projectId: { in: projectIds } },
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      project: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();
  const total = tasks.length;
  const todo = tasks.filter((t) => t.status === TaskStatus.todo).length;
  const inProgress = tasks.filter((t) => t.status === TaskStatus.in_progress).length;
  const done = tasks.filter((t) => t.status === TaskStatus.done).length;
  const overdue = tasks.filter(
    (t) => t.dueDate && t.dueDate < now && t.status !== TaskStatus.done,
  ).length;

  const myTasks = tasks
    .filter((t) => t.assignedTo === userId && t.status !== TaskStatus.done)
    .slice(0, 10);

  const recentTasks = tasks.slice(0, 10);

  return res.json({ total, todo, inProgress, done, overdue, myTasks, recentTasks });
});

router.get("/activity", async (req: AuthRequest, res) => {
  const userId = req.user!.userId;

  const memberships = await prisma.projectMember.findMany({
    where: { userId },
    select: { projectId: true },
  });
  const projectIds = memberships.map((m) => m.projectId);

  const activities = await prisma.task.findMany({
    where: { projectId: { in: projectIds } },
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      project: { select: { id: true, name: true } },
      creator: { select: { id: true, name: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 20,
  });

  return res.json(activities);
});

export default router;
