import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../../api";
import { useAuth } from "../../hooks/useAuth";
import Avatar from "../ui/Avatar";
import type { Project } from "../../types";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    api
      .get<Project[]>("/projects")
      .then((res) => setProjects(res.data))
      .catch(() => {});
  }, []);

  // Refresh projects when navigating
  useEffect(() => {
    const handler = () => {
      api
        .get<Project[]>("/projects")
        .then((res) => setProjects(res.data))
        .catch(() => {});
    };
    window.addEventListener("projects-updated", handler);
    return () => window.removeEventListener("projects-updated", handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className={`sidebar ${collapsed ? "sidebar-collapsed" : ""}`}>
      <div className="sidebar-header">
        {!collapsed && (
          <NavLink to="/" className="sidebar-brand" title="Go to Dashboard">
            <div className="sidebar-logo">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect width="24" height="24" rx="6" fill="#0052CC" />
                <path d="M7 8h10M7 12h7M7 16h4" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <span className="sidebar-brand-text">TaskFlow</span>
          </NavLink>
        )}
        <button
          className="sidebar-toggle"
          onClick={() => setCollapsed(!collapsed)}
          aria-label="Toggle sidebar"
        >
          {collapsed ? "→" : "←"}
        </button>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`} end>
          <span className="sidebar-link-icon">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
              <path d="M2 2h6v6H2zM10 2h6v6h-6zM2 10h6v6H2zM10 10h6v6h-6z" opacity="0.9" />
            </svg>
          </span>
          {!collapsed && <span>Dashboard</span>}
        </NavLink>
        <NavLink to="/projects" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
          <span className="sidebar-link-icon">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
              <path d="M2 3h14a1 1 0 011 1v10a1 1 0 01-1 1H2a1 1 0 01-1-1V4a1 1 0 011-1zm0 3v8h14V6H2z" />
            </svg>
          </span>
          {!collapsed && <span>Projects</span>}
        </NavLink>
      </nav>

      {!collapsed && projects.length > 0 && (
        <div className="sidebar-section">
          <div className="sidebar-section-title">YOUR PROJECTS</div>
          <div className="sidebar-projects">
            {projects.slice(0, 8).map((p) => (
              <div key={p.id} className="sidebar-project-row">
                <NavLink
                  to={`/projects/${p.id}`}
                  className={({ isActive }) =>
                    `sidebar-project-link ${isActive ? "active" : ""}`
                  }
                >
                  <div
                    className="sidebar-project-icon"
                    style={{
                      backgroundColor: `hsl(${p.name.charCodeAt(0) * 37 % 360}, 55%, 50%)`,
                    }}
                  >
                    {p.name[0].toUpperCase()}
                  </div>
                  <span className="sidebar-project-name">{p.name}</span>
                </NavLink>
                <NavLink
                  to={`/projects/${p.id}/settings`}
                  className="sidebar-project-settings"
                  title="Project Settings"
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                    <path d="M7 9a2 2 0 100-4 2 2 0 000 4zm5.7-1.7l-.9-.5a4.8 4.8 0 000-1.6l.9-.5a.3.3 0 00.1-.4l-.9-1.5a.3.3 0 00-.4-.1l-.9.5a4.7 4.7 0 00-1.4-.8l-.1-1a.3.3 0 00-.3-.3H7.2a.3.3 0 00-.3.3l-.1 1a4.7 4.7 0 00-1.4.8l-.9-.5a.3.3 0 00-.4.1l-.9 1.5a.3.3 0 00.1.4l.9.5a4.8 4.8 0 000 1.6l-.9.5a.3.3 0 00-.1.4l.9 1.5a.3.3 0 00.4.1l.9-.5c.4.3.9.6 1.4.8l.1 1a.3.3 0 00.3.3h1.6a.3.3 0 00.3-.3l.1-1c.5-.2 1-.5 1.4-.8l.9.5a.3.3 0 00.4-.1l.9-1.5a.3.3 0 00-.1-.4z" />
                  </svg>
                </NavLink>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="sidebar-footer">
        {user && (
          <div className="sidebar-user">
            <div
              className="sidebar-user-clickable"
              onClick={() => navigate("/profile")}
              title="View Profile"
            >
              <Avatar name={user.name} size={collapsed ? 28 : 32} />
              {!collapsed && (
                <div className="sidebar-user-info">
                  <div className="sidebar-user-name">{user.name}</div>
                  <div className="sidebar-user-email">{user.email}</div>
                </div>
              )}
            </div>
            {!collapsed && (
              <button className="sidebar-logout" onClick={handleLogout} title="Logout">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M6 2h6a2 2 0 012 2v8a2 2 0 01-2 2H6M2 8h8M7 5l3 3-3 3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
