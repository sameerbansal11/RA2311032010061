"use client";
import { useEffect, useState, useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import Link from "next/link";
import NotificationCard from "@/components/NotificationCard";
import { fetchAllNotifications, getTopN, Notification } from "@/lib/notifications";
import { Log } from "@/lib/logger";

export default function PriorityPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [topN, setTopN] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewed, setViewed] = useState<Set<string>>(() => new Set());

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      await Log("frontend", "info", "page", `Priority inbox page loaded — top ${topN}`);
      const all = await fetchAllNotifications();
      await Log("frontend", "debug", "api", `Fetched ${all.length} notifications for priority computation`);
      const top = getTopN(all, topN);
      await Log("frontend", "info", "state", `Top ${topN} notifications computed and rendered`);
      setNotifications(top);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load priority inbox";
      setError(msg);
      await Log("frontend", "error", "api", `Priority inbox fetch failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, [topN]);

  useEffect(() => { load(); }, [load]);

  const handleTopNChange = async (v: number) => {
    setTopN(v);
    await Log("frontend", "info", "component", `Top-N selector changed to: ${v}`);
  };

  const handleView = async (id: string) => {
    if (!viewed.has(id)) {
      setViewed((prev) => new Set(prev).add(id));
      await Log("frontend", "info", "state", `Priority notification ${id} marked as viewed`);
    }
  };

  return (
    <Box sx={{ maxWidth: 720, mx: "auto", px: { xs: 2, sm: 3 }, py: 4 }} className="page-container">
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3, flexWrap: "wrap", gap: 1 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#1a1a1a", fontSize: { xs: "1.2rem", sm: "1.4rem" } }}>
            Priority Inbox
          </Typography>
          <Typography variant="body2" sx={{ color: "#888", mt: 0.3 }}>
            Top notifications ranked by type and recency
          </Typography>
        </Box>
        <Button
          component={Link}
          href="/"
          variant="outlined"
          size="small"
          sx={{ textTransform: "none", borderRadius: "8px", fontWeight: 600, borderColor: "#ddd", color: "#444", "&:hover": { borderColor: "#aaa" } }}
        >
          All Notifications
        </Button>
      </Box>

      {/* Top-N Selector */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
        <Typography sx={{ fontSize: "0.88rem", color: "#555", fontWeight: 500 }}>Show top</Typography>
        <Select
          value={topN}
          onChange={(e) => handleTopNChange(Number(e.target.value))}
          size="small"
          sx={{ fontSize: "0.88rem", borderRadius: "8px", minWidth: 72, "& .MuiOutlinedInput-notchedOutline": { borderColor: "#ddd" } }}
        >
          {[5, 10, 15, 20].map((n) => (
            <MenuItem key={n} value={n}>{n}</MenuItem>
          ))}
        </Select>
        <Typography sx={{ fontSize: "0.88rem", color: "#555" }}>notifications</Typography>
      </Box>

      {/* Priority Legend */}
      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
        {[
          { label: "Placement — highest", color: "#1a5c2a" },
          { label: "Result — medium",     color: "#7b3a00" },
          { label: "Event — standard",    color: "#1a3a5c" },
        ].map((item) => (
          <Box key={item.label} sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: item.color }} />
            <Typography sx={{ fontSize: "0.78rem", color: "#666" }}>{item.label}</Typography>
          </Box>
        ))}
      </Box>

      {/* Content */}
      <Box sx={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #ebebeb", overflow: "hidden", minHeight: 200 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
            <CircularProgress size={28} sx={{ color: "#1a3a5c" }} />
          </Box>
        ) : error ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <Typography sx={{ color: "#c0392b", fontSize: "0.9rem" }}>{error}</Typography>
            <Button onClick={load} size="small" sx={{ mt: 2, textTransform: "none" }}>Retry</Button>
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ py: 8, textAlign: "center" }}>
            <Typography sx={{ color: "#aaa", fontSize: "0.9rem" }}>No notifications available</Typography>
          </Box>
        ) : (
          notifications.map((n, i) => (
            <Box key={n.ID} sx={{ position: "relative" }}>
              <Box sx={{
                position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
                width: 18, height: 18, borderRadius: "50%",
                backgroundColor: "#1a3a5c", display: "flex", alignItems: "center", justifyContent: "center",
                zIndex: 1,
              }}>
                <Typography sx={{ fontSize: "0.6rem", color: "#fff", fontWeight: 700, lineHeight: 1 }}>
                  {i + 1}
                </Typography>
              </Box>
              <Box sx={{ pl: "36px" }}>
                <NotificationCard
                  notification={n}
                  viewed={viewed.has(n.ID)}
                  onClick={handleView}
                />
              </Box>
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
}
