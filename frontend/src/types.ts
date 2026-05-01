export type User = {
  id: string;
  name: string;
  email: string;
};

export type AuthResponse = {
  token: string;
  user: User;
};

export type Member = {
  id: string;
  projectId: string;
  userId: string;
  roleInProject: "admin" | "member";
  user: User;
};

export type Task = {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  assignedTo?: string;
  assignee?: User | null;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  dueDate?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type Project = {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  members: Member[];
  tasks?: Task[];
  _count?: { tasks: number };
};

export type Dashboard = {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
  overdue: number;
  myTasks: (Task & { project: { id: string; name: string } })[];
  recentTasks: (Task & { project: { id: string; name: string } })[];
};

export type InviteDetails = {
  id: string;
  email: string;
  role: "admin" | "member";
  status: "pending" | "accepted" | "expired" | "revoked";
  expiresAt: string;
  project: {
    id: string;
    name: string;
  };
};
