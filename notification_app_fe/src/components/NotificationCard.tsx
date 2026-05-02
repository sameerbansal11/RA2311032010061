"use client";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import PriorityBadge from "./PriorityBadge";
import { Notification } from "@/lib/notifications";

interface Props {
  notification: Notification;
  viewed: boolean;
  onClick: (id: string) => void;
}

export default function NotificationCard({ notification, viewed, onClick }: Props) {
  const { ID, Type, Message, Timestamp } = notification;
  const time = new Date(Timestamp).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <Box
      onClick={() => onClick(ID)}
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 2,
        p: "14px 18px",
        borderBottom: "1px solid #ebebeb",
        backgroundColor: viewed ? "#fafafa" : "#ffffff",
        cursor: "pointer",
        transition: "background 0.15s ease",
        "&:hover": { backgroundColor: "#f4f6f8" },
      }}
    >
      {/* Unread dot */}
      <Box sx={{ pt: "6px", flexShrink: 0 }}>
        <Box sx={{
          width: 8, height: 8, borderRadius: "50%",
          backgroundColor: viewed ? "transparent" : "#1a5c9a",
          border: viewed ? "1.5px solid #d0d0d0" : "none",
        }} />
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: "4px", flexWrap: "wrap" }}>
          <PriorityBadge type={Type} />
          <Typography variant="caption" sx={{ color: "#999", ml: "auto", whiteSpace: "nowrap" }}>
            {time}
          </Typography>
        </Box>
        <Typography
          sx={{
            fontSize: "0.92rem",
            color: viewed ? "#666" : "#1a1a1a",
            fontWeight: viewed ? 400 : 500,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {Message}
        </Typography>
      </Box>
    </Box>
  );
}
