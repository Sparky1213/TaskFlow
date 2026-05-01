import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useToast } from "../hooks/useToast";
import Modal from "../components/ui/Modal";
import EmptyState from "../components/ui/EmptyState";
import Avatar from "../components/ui/Avatar";
import type { Project } from "../types";

export default function ProjectListPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const load = () => {
    api
      .get<Project[]>("/projects")
      .then((res) => setProjects(res.data))
      .catch(() => showToast("Failed to load projects", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await api.post("/projects", { name: newName, description: newDesc });
      setNewName("");
      setNewDesc("");
      setShowCreate(false);
      showToast("Project created!", "success");
      window.dispatchEvent(new Event("projects-updated"));
      load();
    } catch {
      showToast("Failed to create project", "error");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">Manage your team projects</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          + Create Project
        </button>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon="📂"
          title="No projects yet"
          description="Create your first project to get started."
        />
      ) : (
        <div className="project-grid">
          {projects.map((project) => (
            <div
              key={project.id}
              className="project-card"
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <div className="project-card-header">
                <div
                  className="project-card-icon"
                  style={{
                    backgroundColor: `hsl(${project.name.charCodeAt(0) * 37 % 360}, 55%, 50%)`,
                  }}
                >
                  {project.name[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="project-card-name">{project.name}</h3>
                  {project.description && (
                    <p className="project-card-desc">{project.description}</p>
                  )}
                </div>
              </div>
              <div className="project-card-footer">
                <div className="project-card-members">
                  {project.members.slice(0, 4).map((m) => (
                    <Avatar key={m.userId} name={m.user.name} size={28} />
                  ))}
                  {project.members.length > 4 && (
                    <span className="project-card-more">
                      +{project.members.length - 4}
                    </span>
                  )}
                </div>
                <div className="project-card-stats">
                  <span>{project._count?.tasks ?? 0} tasks</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create Project"
      >
        <form className="task-form" onSubmit={handleCreate}>
          <div className="form-group">
            <label htmlFor="project-name">Project Name *</label>
            <input
              id="project-name"
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Website Redesign"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="project-desc">Description</label>
            <textarea
              id="project-desc"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="What is this project about?"
              rows={3}
            />
          </div>
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowCreate(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={creating}>
              {creating ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
