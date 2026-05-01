const COLORS = [
  "#0052CC", "#00875A", "#FF5630", "#6554C0", "#FF991F",
  "#00B8D9", "#36B37E", "#8777D9", "#E2553D", "#2684FF",
];

function hashName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

type AvatarProps = {
  name: string;
  size?: number;
  className?: string;
};

export default function Avatar({ name, size = 32, className = "" }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const color = COLORS[hashName(name) % COLORS.length];

  return (
    <div
      className={`avatar ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        fontSize: size * 0.4,
      }}
      title={name}
    >
      {initials}
    </div>
  );
}
