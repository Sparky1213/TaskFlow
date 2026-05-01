import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate, NavLink } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import TaskModal, { type TaskFormData } from "../components/TaskModal";
import Avatar from "../components/ui/Avatar";
import { PriorityBadge } from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import type { Project, Task } from "../types";

const COLUMNS: { key: Task["status"]; label: string; color: string }[] = [
  { key: "todo", label: "TO DO", color: "#6B778C" },
  { key: "in_progress", label: "IN PROGRESS", color: "#0065FF" },
  { key: "done", label: "DONE", color: "#36B37E" },
];

export default function BoardPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterAssignee, setFilterAssignee] = useState<string>("all");

  const loadProject = useCallback(() => {
    if (!id) return;
    api
      .get<Project>(`/projects/${id}`)
      .then((res) => setProject(res.data))
      .catch(() => {
        showToast("Project not found", "error");
        navigate("/projects");
      })
      .finally(() => setLoading(false));
  }, [id, navigate, showToast]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  const currentMembership = project?.members.find(
    (m) => m.userId === user?.id,
  );
  const isAdmin = currentMembership?.roleInProject === "admin";

  const handleCreateTask = async (data: TaskFormData) => {
    if (!id) return;
    try {
      await api.post(`/projects/${id}/tasks`, {
        title: data.title,
        description: data.description || undefined,
        assignedTo: data.assignedTo || undefined,
        status: data.status,
        priority: data.priority,
        dueDate: data.dueDate || undefined,
      });
      showToast("Task created!", "success");
      loadProject();
    } catch {
      showToast("Failed to create task", "error");
    }
  };

  const handleEditTask = async (data: TaskFormData) => {
    if (!editingTask) return;
    try {
      await api.patch(`/tasks/${editingTask.id}`, {
        title: data.title,
        description: data.description || undefined,
        assignedTo: data.assignedTo || null,
        status: data.status,
        priority: data.priority,
        dueDate: data.dueDate || null,
      });
      showToast("Task updated!", "success");
      setEditingTask(null);
      loadProject();
    } catch {
      showToast("Failed to update task", "error");
    }
  };

  const handleStatusChange = async (task: Task, newStatus: Task["status"]) => {
    try {
      await api.patch(`/tasks/${task.id}`, { status: newStatus });
      loadProject();
    } catch {
      showToast("Failed to update status", "error");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Delete this task?")) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      showToast("Task deleted", "success");
      loadProject();
    } catch {
      showToast("Failed to delete task", "error");
    }
  };

  const formatDueDate = (date?: string) => {
    if (!date) return null;
    const d = new Date(date);
    const now = new Date();
    const isOverdue = d < now;
    const formatted = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    return (
      <span className={`task-card-due ${isOverdue ? "overdue" : ""}`}>
        📅 {formatted}
      </span>
    );
  };

  // Filtered tasks
  const tasks = project?.tasks || [];
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Text search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(q);
        const matchesDesc = task.description?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc) return false;
      }
      // Priority filter
      if (filterPriority !== "all" && task.priority !== filterPriority) return false;
      // Assignee filter
      if (filterAssignee !== "all") {
        if (filterAssignee === "unassigned" && task.assignedTo) return false;
        if (filterAssignee !== "unassigned" && task.assignedTo !== filterAssignee) return false;
      }
      return true;
    });
  }, [tasks, searchQuery, filterPriority, filterAssignee]);

  const hasActiveFilters = searchQuery || filterPriority !== "all" || filterAssignee !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setFilterPriority("all");
    setFilterAssignee("all");
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner" />
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="page page-board">
      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <NavLink to="/projects" className="breadcrumb-link">
              Projects
            </NavLink>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">{project.name}</span>
          </div>
          <h1 className="page-title">{project.name}</h1>
          {project.description && (
            <p className="page-subtitle">{project.description}</p>
          )}
        </div>
        <div className="page-header-actions">
          <div className="board-members">
            {project.members.slice(0, 5).map((m) => (
              <Avatar key={m.userId} name={m.user.name} size={32} />
            ))}
            {project.members.length > 5 && (
              <span className="board-members-more">
                +{project.members.length - 5}
              </span>
            )}
          </div>
          <NavLink
            to={`/projects/${id}/settings`}
            className="btn btn-secondary"
          >
            ⚙ Settings
          </NavLink>
          {isAdmin && (
            <button
              className="btn btn-primary"
              onClick={() => {
                setEditingTask(null);
                setTaskModalOpen(true);
              }}
            >
              + Create Task
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      {tasks.length > 0 && (
        <div className="board-filters">
          <div className="board-filter-search">
            <svg className="board-filter-search-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M11.7 10.3a6 6 0 10-1.4 1.4l3.8 3.8a1 1 0 001.4-1.4l-3.8-3.8zM7 11a4 4 0 110-8 4 4 0 010 8z" />
            </svg>
            <input
              type="text"
              className="board-filter-input"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="board-filter-select"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="all">All Priorities</option>
            <option value="high">🔴 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🟢 Low</option>
          </select>
          <select
            className="board-filter-select"
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
          >
            <option value="all">All Members</option>
            <option value="unassigned">Unassigned</option>
            {project.members.map((m) => (
              <option key={m.userId} value={m.userId}>
                {m.user.name}
              </option>
            ))}
          </select>
          {hasActiveFilters && (
            <button className="board-filter-clear" onClick={clearFilters}>
              ✕ Clear
            </button>
          )}
          {hasActiveFilters && (
            <span className="board-filter-count">
              {filteredTasks.length} of {tasks.length} tasks
            </span>
          )}
        </div>
      )}

      {tasks.length === 0 ? (
        <EmptyState
          icon="📝"
          title="No tasks yet"
          description={
            isAdmin
              ? 'Click "Create Task" to add your first task.'
              : "No tasks have been created in this project."
          }
        />
      ) : (
        <div className="board">
          {COLUMNS.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.key);
            return (
              <div className="board-column" key={col.key}>
                <div className="board-column-header">
                  <span
                    className="board-column-dot"
                    style={{ backgroundColor: col.color }}
                  />
                  <span className="board-column-title">{col.label}</span>
                  <span className="board-column-count">{colTasks.length}</span>
                </div>
                <div className="board-column-body">
                  {colTasks.map((task) => (
                    <div
                      key={task.id}
                      className="task-card"
                      onClick={() => {
                        setEditingTask(task);
                        setTaskModalOpen(true);
                      }}
                    >
                      <div className="task-card-title">{task.title}</div>
                      {task.description && (
                        <div className="task-card-desc">
                          {task.description.slice(0, 80)}
                          {task.description.length > 80 ? "..." : ""}
                        </div>
                      )}
                      <div className="task-card-footer">
                        <div className="task-card-badges">
                          <PriorityBadge priority={task.priority} />
                          {formatDueDate(task.dueDate)}
                        </div>
                        <div className="task-card-actions">
                          {task.assignee && (
                            <Avatar name={task.assignee.name} size={24} />
                          )}
                        </div>
                      </div>
                      <div className="task-card-status-actions" onClick={(e) => e.stopPropagation()}>
                        {col.key !== "todo" && (
                          <button
                            className="task-move-btn"
                            title={col.key === "done" ? "Move to In Progress" : "Move to To Do"}
                            onClick={() =>
                              handleStatusChange(
                                task,
                                col.key === "done" ? "in_progress" : "todo",
                              )
                            }
                          >
                            ←
                          </button>
                        )}
                        {col.key !== "done" && (
                          <button
                            className="task-move-btn"
                            title={col.key === "todo" ? "Move to In Progress" : "Move to Done"}
                            onClick={() =>
                              handleStatusChange(
                                task,
                                col.key === "todo" ? "in_progress" : "done",
                              )
                            }
                          >
                            →
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            className="task-delete-btn"
                            title="Delete task"
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {colTasks.length === 0 && hasActiveFilters && (
                    <div className="board-column-empty">No matching tasks</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <TaskModal
        open={taskModalOpen}
        onClose={() => {
          setTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={editingTask ? handleEditTask : handleCreateTask}
        members={project.members}
        task={editingTask}
      />
    </div>
  );
}
