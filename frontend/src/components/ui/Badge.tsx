import type { ReactNode } from "react";

type BadgeProps = {
  variant?: "default" | "blue" | "green" | "red" | "orange" | "gray" | "purple";
  children: ReactNode;
  className?: string;
};

export default function Badge({ variant = "default", children, className = "" }: BadgeProps) {
  return (
    <span className={`badge badge-${variant} ${className}`}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: "todo" | "in_progress" | "done" }) {
  const map = {
    todo: { label: "TO DO", variant: "gray" as const },
    in_progress: { label: "IN PROGRESS", variant: "blue" as const },
    done: { label: "DONE", variant: "green" as const },
  };
  const { label, variant } = map[status];
  return <Badge variant={variant}>{label}</Badge>;
}

export function PriorityBadge({ priority }: { priority: "low" | "medium" | "high" }) {
  const map = {
    low: { label: "Low", variant: "gray" as const, icon: "↓" },
    medium: { label: "Medium", variant: "orange" as const, icon: "→" },
    high: { label: "High", variant: "red" as const, icon: "↑" },
  };
  const { label, variant, icon } = map[priority];
  return (
    <Badge variant={variant}>
      <span className="priority-icon">{icon}</span> {label}
    </Badge>
  );
}
