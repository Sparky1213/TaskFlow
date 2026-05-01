import { ProjectRole, TaskPriority, TaskStatus } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validation";
import { prisma } from "../prisma";
import { AuthRequest } from "../types";

const router = Router();
router.use(requireAuth);
const getParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const updateTaskSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().max(500).optional(),
  assignedTo: z.string().nullable().optional(),
  status: z.enum(["todo", "in_progress", "done"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  dueDate: z.iso.datetime().nullable().optional(),
});

router.patch("/:id", validate(updateTaskSchema), async (req: AuthRequest, res) => {
  const taskId = getParam(req.params.id);
  if (!taskId) {
    return res.status(400).json({ message: "Task id is required." });
  }
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { project: true },
  });
  if (!task) {
    return res.status(404).json({ message: "Task not found." });
  }

  const userId = req.user!.userId;
  const membership = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: { projectId: task.projectId, userId },
    },
  });

  if (!membership) {
    return res.status(403).json({ message: "Project membership required." });
  }

  const isAdmin = membership.roleInProject === ProjectRole.admin;
  const isAssignee = task.assignedTo === userId;

  if (!isAdmin && !isAssignee) {
    return res.status(403).json({ message: "Only admins or assignee can update this task." });
  }

  const payload = req.body;
  if (!isAdmin) {
    const keys = Object.keys(payload);
    const disallowed = keys.some((k) => !["status"].includes(k));
    if (disallowed) {
      return res.status(403).json({ message: "Members can only update status." });
    }
  }

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: {
      title: payload.title,
      description: payload.description,
      assignedTo: payload.assignedTo,
      status: payload.status as TaskStatus | undefined,
      priority: payload.priority as TaskPriority | undefined,
      dueDate:
        payload.dueDate === undefined
          ? undefined
          : payload.dueDate === null
            ? null
            : new Date(payload.dueDate),
    },
    include: {
      assignee: { select: { id: true, name: true, email: true } },
    },
  });

  return res.json(updated);
});

router.delete("/:id", async (req: AuthRequest, res) => {
  const taskId = getParam(req.params.id);
  if (!taskId) {
    return res.status(400).json({ message: "Task id is required." });
  }

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) {
    return res.status(404).json({ message: "Task not found." });
  }

  const userId = req.user!.userId;
  const membership = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: { projectId: task.projectId, userId },
    },
  });

  if (!membership || membership.roleInProject !== ProjectRole.admin) {
    return res.status(403).json({ message: "Admin access required to delete tasks." });
  }

  await prisma.task.delete({ where: { id: taskId } });
  return res.status(204).send();
});

// --- Task Comments ---

router.get("/:id/comments", async (req: AuthRequest, res) => {
  const taskId = getParam(req.params.id);
  if (!taskId) {
    return res.status(400).json({ message: "Task id is required." });
  }

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) {
    return res.status(404).json({ message: "Task not found." });
  }

  const userId = req.user!.userId;
  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId: task.projectId, userId } },
  });
  if (!membership) {
    return res.status(403).json({ message: "Project membership required." });
  }

  const comments = await prisma.comment.findMany({
    where: { taskId },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "asc" },
  });

  return res.json(comments);
});

const createCommentSchema = z.object({
  content: z.string().min(1).max(2000),
});

router.post("/:id/comments", validate(createCommentSchema), async (req: AuthRequest, res) => {
  const taskId = getParam(req.params.id);
  if (!taskId) {
    return res.status(400).json({ message: "Task id is required." });
  }

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) {
    return res.status(404).json({ message: "Task not found." });
  }

  const userId = req.user!.userId;
  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId: task.projectId, userId } },
  });
  if (!membership) {
    return res.status(403).json({ message: "Project membership required." });
  }

  const comment = await prisma.comment.create({
    data: {
      taskId,
      userId,
      content: req.body.content,
    },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  return res.status(201).json(comment);
});

export default router;
