import { useState, useEffect, useRef, type FormEvent } from "react";
import Modal from "./ui/Modal";
import Avatar from "./ui/Avatar";
import { api } from "../api";
import type { Task, Member } from "../types";

type TaskModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => Promise<void>;
  members: Member[];
  task?: Task | null;
};

export type TaskFormData = {
  title: string;
  description: string;
  assignedTo: string;
  status: Task["status"];
  priority: Task["priority"];
  dueDate: string;
};

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; name: string; email: string };
};

export default function TaskModal({
  open,
  onClose,
  onSubmit,
  members,
  task,
}: TaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [status, setStatus] = useState<Task["status"]>("todo");
  const [priority, setPriority] = useState<Task["priority"]>("medium");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Comments state
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [postingComment, setPostingComment] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setAssignedTo(task.assignedTo || "");
      setStatus(task.status);
      setPriority(task.priority);
      setDueDate(task.dueDate ? task.dueDate.slice(0, 10) : "");
      // Load comments for existing task
      loadComments(task.id);
    } else if (open) {
      setTitle("");
      setDescription("");
      setAssignedTo("");
      setStatus("todo");
      setPriority("medium");
      setDueDate("");
      setComments([]);
    }
  }, [open, task]);

  const loadComments = async (taskId: string) => {
    setLoadingComments(true);
    try {
      const res = await api.get<Comment[]>(`/tasks/${taskId}/comments`);
      setComments(res.data);
    } catch {
      // Silently fail — comments are not critical
    } finally {
      setLoadingComments(false);
    }
  };

  const handlePostComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !task) return;
    setPostingComment(true);
    try {
      const res = await api.post<Comment>(`/tasks/${task.id}/comments`, {
        content: newComment,
      });
      setComments((prev) => [...prev, res.data]);
      setNewComment("");
      // Scroll to bottom
      setTimeout(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch {
      // Silently fail
    } finally {
      setPostingComment(false);
    }
  };

  const formatCommentTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        title,
        description,
        assignedTo,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : "",
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={task ? "Edit Task" : "Create Task"}
      width="640px"
    >
      <form className="task-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="task-title">Title *</label>
          <input
            id="task-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="task-desc">Description</label>
          <textarea
            id="task-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description..."
            rows={3}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="task-status">Status</label>
            <select
              id="task-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as Task["status"])}
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="task-priority">Priority</label>
            <select
              id="task-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Task["priority"])}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="task-assignee">Assignee</label>
            <select
              id="task-assignee"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.user.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="task-due">Due Date</label>
            <input
              id="task-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Saving..." : task ? "Save Changes" : "Create Task"}
          </button>
        </div>
      </form>

      {/* Comments Section — only shown when editing an existing task */}
      {task && (
        <div className="comments-section">
          <div className="comments-header">
            <h3 className="comments-title">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style={{ marginRight: 6, verticalAlign: "text-bottom" }}>
                <path d="M1 3a2 2 0 012-2h10a2 2 0 012 2v7a2 2 0 01-2 2H5.5L2 15V12a2 2 0 01-1-1.7V3z" opacity="0.85" />
              </svg>
              Activity
            </h3>
            <span className="comments-count">{comments.length}</span>
          </div>

          <div className="comments-list">
            {loadingComments ? (
              <div className="comments-loading">
                <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
              </div>
            ) : comments.length === 0 ? (
              <div className="comments-empty">
                No comments yet. Start the conversation!
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="comment-item">
                  <Avatar name={comment.user.name} size={28} />
                  <div className="comment-body">
                    <div className="comment-meta">
                      <span className="comment-author">{comment.user.name}</span>
                      <span className="comment-time">{formatCommentTime(comment.createdAt)}</span>
                    </div>
                    <div className="comment-content">{comment.content}</div>
                  </div>
                </div>
              ))
            )}
            <div ref={commentsEndRef} />
          </div>

          <form className="comment-form" onSubmit={handlePostComment}>
            <input
              type="text"
              className="comment-input"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              disabled={postingComment}
            />
            <button
              type="submit"
              className="btn btn-primary btn-sm comment-submit"
              disabled={postingComment || !newComment.trim()}
            >
              {postingComment ? "..." : "Send"}
            </button>
          </form>
        </div>
      )}
    </Modal>
  );
}
