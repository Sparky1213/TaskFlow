import { useEffect, useState, type FormEvent } from "react";
import { useParams, NavLink, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import Avatar from "../components/ui/Avatar";
import type { Project } from "../types";

export default function ProjectSettingsPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [memberEmail, setMemberEmail] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [addingMember, setAddingMember] = useState(false);
  const [sendingInvite, setSendingInvite] = useState(false);

  const loadProject = () => {
    if (!id) return;
    api
      .get<Project>(`/projects/${id}`)
      .then((res) => setProject(res.data))
      .catch(() => {
        showToast("Project not found", "error");
        navigate("/projects");
      })
      .finally(() => setLoading(false));
  };

  useEffect(loadProject, [id]);

  const isAdmin = project?.members.find(
    (m) => m.userId === user?.id,
  )?.roleInProject === "admin";

  const handleAddMember = async (e: FormEvent) => {
    e.preventDefault();
    if (!memberEmail.trim() || !id) return;
    setAddingMember(true);
    try {
      await api.post(`/projects/${id}/members`, {
        email: memberEmail,
        roleInProject: "member",
      });
      setMemberEmail("");
      showToast("Member added!", "success");
      loadProject();
    } catch {
      showToast("Could not add member. User may not exist.", "error");
    } finally {
      setAddingMember(false);
    }
  };

  const handleSendInvite = async (e: FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !id) return;
    setSendingInvite(true);
    try {
      await api.post(`/projects/${id}/invites`, {
        email: inviteEmail,
        roleInProject: "member",
      });
      setInviteEmail("");
      showToast("Invite sent!", "success");
    } catch {
      showToast("Failed to send invite", "error");
    } finally {
      setSendingInvite(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!id || !confirm("Remove this member?")) return;
    try {
      await api.delete(`/projects/${id}/members/${userId}`);
      showToast("Member removed", "success");
      loadProject();
    } catch {
      showToast("Failed to remove member", "error");
    }
  };

  const handleDeleteProject = async () => {
    if (!id || !confirm("Delete this project? This cannot be undone.")) return;
    try {
      await api.delete(`/projects/${id}`);
      showToast("Project deleted", "success");
      window.dispatchEvent(new Event("projects-updated"));
      navigate("/projects");
    } catch {
      showToast("Failed to delete project", "error");
    }
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
    <div className="page">
      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <NavLink to="/projects" className="breadcrumb-link">
              Projects
            </NavLink>
            <span className="breadcrumb-sep">/</span>
            <NavLink to={`/projects/${id}`} className="breadcrumb-link">
              {project.name}
            </NavLink>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">Settings</span>
          </div>
          <h1 className="page-title">Project Settings</h1>
        </div>
      </div>

      <div className="settings-grid">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Team Members</h2>
            <span className="card-count">{project.members.length}</span>
          </div>
          <div className="member-list">
            {project.members.map((m) => (
              <div key={m.userId} className="member-row">
                <div className="member-info">
                  <Avatar name={m.user.name} size={36} />
                  <div>
                    <div className="member-name">{m.user.name}</div>
                    <div className="member-email">{m.user.email}</div>
                  </div>
                </div>
                <div className="member-actions">
                  <span
                    className={`role-badge ${m.roleInProject === "admin" ? "role-admin" : "role-member"}`}
                  >
                    {m.roleInProject}
                  </span>
                  {isAdmin && m.userId !== user?.id && (
                    <button
                      className="btn-icon btn-danger-icon"
                      onClick={() => handleRemoveMember(m.userId)}
                      title="Remove member"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {isAdmin && (
          <>
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Add Existing User</h2>
              </div>
              <p className="card-desc">
                Add a user who already has an account.
              </p>
              <form className="settings-form" onSubmit={handleAddMember}>
                <div className="form-row">
                  <input
                    type="email"
                    value={memberEmail}
                    onChange={(e) => setMemberEmail(e.target.value)}
                    placeholder="user@example.com"
                    required
                  />
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={addingMember}
                  >
                    {addingMember ? "Adding..." : "Add Member"}
                  </button>
                </div>
              </form>
            </div>

            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Invite via Email</h2>
              </div>
              <p className="card-desc">
                Send an email invitation to join this project.
              </p>
              <form className="settings-form" onSubmit={handleSendInvite}>
                <div className="form-row">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="invite@example.com"
                    required
                  />
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={sendingInvite}
                  >
                    {sendingInvite ? "Sending..." : "Send Invite"}
                  </button>
                </div>
              </form>
            </div>

            <div className="card card-danger">
              <div className="card-header">
                <h2 className="card-title">Danger Zone</h2>
              </div>
              <p className="card-desc">
                Once you delete a project, there is no going back. All tasks and
                data will be permanently removed.
              </p>
              <button
                className="btn btn-danger"
                onClick={handleDeleteProject}
              >
                Delete Project
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
