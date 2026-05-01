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
  const [isOpen, setIsOpen] = useState(false); // 🔥 mobile state

  useEffect(() => {
    api.get<Project[]>("/projects")
      .then((res) => setProjects(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handler = () => {
      api.get<Project[]>("/projects")
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
    <>
      {/* 🔥 Mobile Top Bar */}
      <div className="mobile-header">
        <button onClick={() => setIsOpen(true)} className="mobile-menu-btn">
          ☰
        </button>
        <h3>TaskFlow</h3>
      </div>

      {/* 🔥 Overlay */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />
      )}

      <aside
        className={`sidebar 
        ${collapsed ? "sidebar-collapsed" : ""} 
        ${isOpen ? "sidebar-open" : ""}`}
      >
        {/* 🔥 Close button (mobile only) */}
        <div className="sidebar-header">
          <button className="mobile-close-btn" onClick={() => setIsOpen(false)}>
            ✕
          </button>

          {!collapsed && (
            <NavLink to="/" className="sidebar-brand">
              <span>TaskFlow</span>
            </NavLink>
          )}

          <button
            className="sidebar-toggle"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? "→" : "←"}
          </button>
        </div>

        {/* NAV */}
        <nav className="sidebar-nav">
          <NavLink to="/" className="sidebar-link">
            {!collapsed && <span>Dashboard</span>}
          </NavLink>

          <NavLink to="/projects" className="sidebar-link">
            {!collapsed && <span>Projects</span>}
          </NavLink>
        </nav>

        {/* PROJECTS */}
        {!collapsed && projects.length > 0 && (
          <div className="sidebar-section">
            <div className="sidebar-section-title">YOUR PROJECTS</div>

            {projects.map((p) => (
              <NavLink key={p.id} to={`/projects/${p.id}`}>
                {p.name}
              </NavLink>
            ))}
          </div>
        )}

        {/* FOOTER */}
        <div className="sidebar-footer">
          {user && (
            <div onClick={() => navigate("/profile")}>
              <Avatar name={user.name} />
              {!collapsed && <span>{user.name}</span>}
            </div>
          )}

          {!collapsed && (
            <button onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
      </aside>
    </>
  );
}