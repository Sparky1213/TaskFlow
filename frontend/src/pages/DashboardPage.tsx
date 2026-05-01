import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../hooks/useAuth";
import Avatar from "../components/ui/Avatar";
import { StatusBadge, PriorityBadge } from "../components/ui/Badge";
import type { Dashboard } from "../types";

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Dashboard>("/dashboard")
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner" />
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    { label: "Total Tasks", value: data.total, icon: "📋", color: "#0052CC" },
    { label: "To Do", value: data.todo, icon: "📝", color: "#6B778C" },
    { label: "In Progress", value: data.inProgress, icon: "🔄", color: "#0065FF" },
    { label: "Done", value: data.done, icon: "✅", color: "#36B37E" },
    { label: "Overdue", value: data.overdue, icon: "⚠️", color: "#FF5630" },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Welcome back, {user?.name?.split(" ")[0]}! Here's your overview.
          </p>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((s) => (
          <div className="stat-card" key={s.label}>
            <div className="stat-card-icon">{s.icon}</div>
            <div className="stat-card-value" style={{ color: s.color }}>
              {s.value}
            </div>
            <div className="stat-card-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">My Tasks</h2>
            <span className="card-count">{data.myTasks.length}</span>
          </div>
          {data.myTasks.length === 0 ? (
            <div className="card-empty">No tasks assigned to you</div>
          ) : (
            <div className="task-list">
              {data.myTasks.map((task) => (
                <div
                  key={task.id}
                  className="task-list-item"
                  onClick={() => navigate(`/projects/${task.projectId}`)}
                >
                  <div className="task-list-item-main">
                    <span className="task-list-item-title">{task.title}</span>
                    <span className="task-list-item-project">{task.project.name}</span>
                  </div>
                  <div className="task-list-item-meta">
                    <StatusBadge status={task.status} />
                    <PriorityBadge priority={task.priority} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Activity</h2>
          </div>
          {data.recentTasks.length === 0 ? (
            <div className="card-empty">No recent tasks</div>
          ) : (
            <div className="task-list">
              {data.recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="task-list-item"
                  onClick={() => navigate(`/projects/${task.projectId}`)}
                >
                  <div className="task-list-item-main">
                    <span className="task-list-item-title">{task.title}</span>
                    <span className="task-list-item-project">{task.project.name}</span>
                  </div>
                  <div className="task-list-item-meta">
                    <StatusBadge status={task.status} />
                    {task.assignee && (
                      <Avatar name={task.assignee.name} size={24} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
