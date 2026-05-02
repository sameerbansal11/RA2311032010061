import Chip from "@mui/material/Chip";

const CONFIG = {
  Placement: { color: "#1a5c2a", bg: "#e6f4ea", label: "Placement" },
  Result:    { color: "#7b3a00", bg: "#fff3e0", label: "Result" },
  Event:     { color: "#1a3a5c", bg: "#e3f0fb", label: "Event" },
};

export default function PriorityBadge({ type }: { type: "Placement" | "Result" | "Event" }) {
  const c = CONFIG[type];
  return (
    <Chip
      label={c.label}
      size="small"
      sx={{
        backgroundColor: c.bg,
        color: c.color,
        fontWeight: 600,
        fontSize: "0.72rem",
        letterSpacing: "0.02em",
        borderRadius: "6px",
        height: "22px",
      }}
    />
  );
}
