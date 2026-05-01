import { ProjectRole, TaskPriority, TaskStatus } from "@prisma/client";
import crypto from "crypto";
import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";
import {
  requireProjectAdmin,
  requireProjectMember,
} from "../middleware/projectAccess";
import { validate } from "../middleware/validation";
import { prisma } from "../prisma";
import { AuthRequest } from "../types";
import { sendInviteEmail } from "../utils/mailer";

const router = Router();
router.use(requireAuth);
const getParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const createProjectSchema = z.object({
  name: z.string().min(2),
  description: z.string().max(500).optional(),
});

const addMemberSchema = z.object({
  email: z.email(),
  roleInProject: z.enum(["admin", "member"]).default("member"),
});

const createTaskSchema = z.object({
  title: z.string().min(2),
  description: z.string().max(500).optional(),
  assignedTo: z.string().optional(),
  status: z.enum(["todo", "in_progress", "done"]).default("todo"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  dueDate: z.iso.datetime().optional(),
});

const inviteMemberSchema = z.object({
  email: z.email(),
  roleInProject: z.enum(["admin", "member"]).default("member"),
});

router.post("/", validate(createProjectSchema), async (req: AuthRequest, res) => {
  const { name, description } = req.body;
  const creatorId = req.user!.userId;

  const project = await prisma.project.create({
    data: {
      name,
      description,
      createdBy: creatorId,
      members: {
        create: { userId: creatorId, roleInProject: ProjectRole.admin },
      },
    },
  });

  return res.status(201).json(project);
});

router.get("/", async (req: AuthRequest, res) => {
  const userId = req.user!.userId;
  const projects = await prisma.project.findMany({
    where: { members: { some: { userId } } },
    include: {
      members: { include: { user: { select: { id: true, name: true, email: true } } } },
      _count: { select: { tasks: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return res.json(projects);
});

router.get("/:id", requireProjectMember, async (req, res) => {
  const projectId = getParam(req.params.id);
  if (!projectId) {
    return res.status(400).json({ message: "Project id is required." });
  }
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: { include: { user: { select: { id: true, name: true, email: true } } } },
      tasks: {
        orderBy: { createdAt: "desc" },
        include: {
          assignee: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  if (!project) {
    return res.status(404).json({ message: "Project not found." });
  }
  return res.json(project);
});

router.delete("/:id", requireProjectAdmin, async (req, res) => {
  const projectId = getParam(req.params.id);
  if (!projectId) {
    return res.status(400).json({ message: "Project id is required." });
  }

  await prisma.project.delete({ where: { id: projectId } });
  return res.status(204).send();
});

router.post("/:id/members", requireProjectAdmin, validate(addMemberSchema), async (req, res) => {
  const projectId = getParam(req.params.id);
  if (!projectId) {
    return res.status(400).json({ message: "Project id is required." });
  }
  const { email, roleInProject } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  const membership = await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId, userId: user.id } },
    update: { roleInProject: roleInProject as ProjectRole },
    create: {
      projectId,
      userId: user.id,
      roleInProject: roleInProject as ProjectRole,
    },
  });
  return res.status(201).json(membership);
});

router.post("/:id/invites", requireProjectAdmin, validate(inviteMemberSchema), async (req: AuthRequest, res) => {
  const projectId = getParam(req.params.id);
  if (!projectId) {
    return res.status(400).json({ message: "Project id is required." });
  }

  const { email, roleInProject } = req.body;
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    return res.status(404).json({ message: "Project not found." });
  }

  const inviter = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  if (!inviter) {
    return res.status(404).json({ message: "Inviter not found." });
  }

  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

  const invite = await prisma.invite.create({
    data: {
      projectId,
      email,
      role: roleInProject as ProjectRole,
      token,
      expiresAt,
      createdBy: req.user!.userId,
    },
  });

  const appBaseUrl = process.env.APP_BASE_URL || "http://localhost:5173";
  const inviteLink = `${appBaseUrl}/?inviteToken=${token}`;
  await sendInviteEmail({
    to: email,
    projectName: project.name,
    inviterName: inviter.name,
    inviteLink,
  });

  return res.status(201).json({
    message: "Invite sent.",
    invite: {
      id: invite.id,
      email: invite.email,
      role: invite.role,
      expiresAt: invite.expiresAt,
      status: invite.status,
    },
  });
});

router.delete("/:id/members/:userId", requireProjectAdmin, async (req, res) => {
  const projectId = getParam(req.params.id);
  const userId = getParam(req.params.userId);
  if (!projectId || !userId) {
    return res.status(400).json({ message: "Project id and user id are required." });
  }
  await prisma.projectMember.delete({
    where: { projectId_userId: { projectId, userId } },
  });
  return res.status(204).send();
});

router.get("/:id/tasks", requireProjectMember, async (req, res) => {
  const projectId = getParam(req.params.id);
  if (!projectId) {
    return res.status(400).json({ message: "Project id is required." });
  }
  const tasks = await prisma.task.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    include: {
      assignee: { select: { id: true, name: true, email: true } },
    },
  });
  return res.json(tasks);
});

router.post("/:id/tasks", requireProjectAdmin, validate(createTaskSchema), async (req: AuthRequest, res) => {
  const projectId = getParam(req.params.id);
  if (!projectId) {
    return res.status(400).json({ message: "Project id is required." });
  }
  const { title, description, assignedTo, status, priority, dueDate } = req.body;

  const task = await prisma.task.create({
    data: {
      projectId,
      title,
      description,
      assignedTo,
      status: status as TaskStatus,
      priority: priority as TaskPriority,
      dueDate: dueDate ? new Date(dueDate) : null,
      createdBy: req.user!.userId,
    },
    include: {
      assignee: { select: { id: true, name: true, email: true } },
    },
  });
  return res.status(201).json(task);
});

router.get("/membership-invites/:token", requireAuth, async (req: AuthRequest, res) => {
  const token = getParam(req.params.token);
  if (!token) {
    return res.status(400).json({ message: "Invite token is required." });
  }

  const invite = await prisma.invite.findUnique({
    where: { token },
    include: { project: { select: { id: true, name: true } } },
  });
  if (!invite) {
    return res.status(404).json({ message: "Invite not found." });
  }

  return res.json({
    id: invite.id,
    email: invite.email,
    role: invite.role,
    status: invite.status,
    expiresAt: invite.expiresAt,
    project: invite.project,
  });
});

router.post("/membership-invites/:token/accept", requireAuth, async (req: AuthRequest, res) => {
  const token = getParam(req.params.token);
  if (!token) {
    return res.status(400).json({ message: "Invite token is required." });
  }

  const invite = await prisma.invite.findUnique({ where: { token } });
  if (!invite) {
    return res.status(404).json({ message: "Invite not found." });
  }

  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  if (user.email.toLowerCase() !== invite.email.toLowerCase()) {
    return res.status(403).json({ message: "Invite email does not match logged-in user." });
  }

  if (invite.status !== "pending") {
    return res.status(400).json({ message: "Invite is no longer pending." });
  }

  if (invite.expiresAt < new Date()) {
    await prisma.invite.update({
      where: { id: invite.id },
      data: { status: "expired" },
    });
    return res.status(400).json({ message: "Invite has expired." });
  }

  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: invite.projectId, userId: user.id } },
    update: { roleInProject: invite.role },
    create: {
      projectId: invite.projectId,
      userId: user.id,
      roleInProject: invite.role,
    },
  });

  await prisma.invite.update({
    where: { id: invite.id },
    data: { status: "accepted", acceptedAt: new Date() },
  });

  return res.json({ message: "Invite accepted successfully." });
});

export default router;
