type EmptyStateProps = {
  icon?: string;
  title: string;
  description?: string;
};

export default function EmptyState({
  icon = "📋",
  title,
  description,
}: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-desc">{description}</p>}
    </div>
  );
}
