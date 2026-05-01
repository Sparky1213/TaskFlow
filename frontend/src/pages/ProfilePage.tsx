import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import Avatar from "../components/ui/Avatar";
import type { Project } from "../types";

type ProfileData = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editName, setEditName] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get<ProfileData>("/auth/me"),
      api.get<Project[]>("/projects"),
    ])
      .then(([profileRes, projectsRes]) => {
        setProfile(profileRes.data);
        setEditName(profileRes.data.name);
        setProjects(projectsRes.data);
      })
      .catch(() => showToast("Failed to load profile", "error"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || editName === profile?.name) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      const res = await api.patch<ProfileData>("/auth/me", { name: editName });
      setProfile(res.data);
      setUser({ id: res.data.id, name: res.data.name, email: res.data.email });
      setEditing(false);
      showToast("Profile updated!", "success");
    } catch {
      showToast("Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="page profile-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your account settings</p>
        </div>
      </div>

      <div className="profile-layout">
        {/* Profile Card */}
        <div className="profile-card">
          <div className="profile-card-banner" />
          <div className="profile-card-body">
            <div className="profile-avatar-wrapper">
              <Avatar name={profile.name} size={80} />
              <div className="profile-avatar-badge">✏️</div>
            </div>

            {editing ? (
              <form className="profile-edit-form" onSubmit={handleSave}>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="profile-name-input"
                  autoFocus
                  minLength={2}
                  required
                />
                <div className="profile-edit-actions">
                  <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setEditing(false);
                      setEditName(profile.name);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-name-section">
                <h2 className="profile-name">{profile.name}</h2>
                <button
                  className="profile-edit-btn"
                  onClick={() => setEditing(true)}
                  title="Edit name"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                    <path d="M10.6 1.4a1.4 1.4 0 012 2L4.5 11.5 1 13l1.5-3.5 8.1-8.1z" />
                  </svg>
                </button>
              </div>
            )}

            <div className="profile-email">{profile.email}</div>

            <div className="profile-info-grid">
              <div className="profile-info-item">
                <span className="profile-info-label">Member Since</span>
                <span className="profile-info-value">{formatDate(profile.createdAt)}</span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">Projects</span>
                <span className="profile-info-value">{projects.length}</span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">Role</span>
                <span className="profile-info-value">Team Member</span>
              </div>
            </div>
          </div>
        </div>

        {/* Projects Card */}
        <div className="card profile-projects-card">
          <div className="card-header">
            <h2 className="card-title">My Projects</h2>
            <span className="card-count">{projects.length}</span>
          </div>
          {projects.length === 0 ? (
            <div className="card-empty">You haven't joined any projects yet.</div>
          ) : (
            <div className="profile-project-list">
              {projects.map((project) => {
                const membership = project.members.find((m) => m.userId === user?.id);
                return (
                  <div
                    key={project.id}
                    className="profile-project-item"
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    <div className="profile-project-info">
                      <div
                        className="sidebar-project-icon"
                        style={{
                          backgroundColor: `hsl(${project.name.charCodeAt(0) * 37 % 360}, 55%, 50%)`,
                        }}
                      >
                        {project.name[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="profile-project-name">{project.name}</div>
                        {project.description && (
                          <div className="profile-project-desc">{project.description}</div>
                        )}
                      </div>
                    </div>
                    <div className="profile-project-meta">
                      <span
                        className={`role-badge ${membership?.roleInProject === "admin" ? "role-admin" : "role-member"}`}
                      >
                        {membership?.roleInProject || "member"}
                      </span>
                      <span className="profile-project-tasks">
                        {project._count?.tasks ?? 0} tasks
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
