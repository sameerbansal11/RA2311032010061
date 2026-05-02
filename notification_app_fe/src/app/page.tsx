"use client";
import { useEffect, useState, useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Pagination from "@mui/material/Pagination";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import Link from "next/link";
import NotificationCard from "@/components/NotificationCard";
import FilterBar from "@/components/FilterBar";
import { fetchNotifications, Notification, NotificationType } from "@/lib/notifications";
import { Log } from "@/lib/logger";

const PAGE_SIZE = 10;

export default function AllNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<NotificationType>("All");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewed, setViewed] = useState<Set<string>>(() => new Set());

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      await Log("frontend", "info", "page", `All notifications page loaded — filter: ${filter}, page: ${page}`);
      const data = await fetchNotifications({
        limit: PAGE_SIZE,
        page,
        notification_type: filter,
      });
      await Log("frontend", "debug", "api", `Fetched ${data.length} notifications — filter: ${filter}`);
      setNotifications(data);
      setTotal(data.length === PAGE_SIZE ? page * PAGE_SIZE + 1 : page * PAGE_SIZE);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to fetch notifications";
      setError(msg);
      await Log("frontend", "error", "api", `Failed to fetch notifications: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => { load(); }, [load]);

  const handleFilterChange = async (v: NotificationType) => {
    setFilter(v);
    setPage(1);
    await Log("frontend", "info", "component", `Filter changed to: ${v}`);
  };

  const handleView = async (id: string) => {
    if (!viewed.has(id)) {
      setViewed((prev) => new Set(prev).add(id));
      await Log("frontend", "info", "state", `Notification ${id} marked as viewed`);
    }
  };

  return (
    <Box sx={{ maxWidth: 720, mx: "auto", px: { xs: 2, sm: 3 }, py: 4 }} className="page-container">
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3, flexWrap: "wrap", gap: 1 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#1a1a1a", fontSize: { xs: "1.2rem", sm: "1.4rem" } }}>
            Notifications
          </Typography>
          <Typography variant="body2" sx={{ color: "#888", mt: 0.3 }}>
            Campus updates — placements, results & events
          </Typography>
        </Box>
        <Button
          component={Link}
          href="/priority"
          variant="contained"
          size="small"
          sx={{ backgroundColor: "#1a3a5c", textTransform: "none", borderRadius: "8px", fontWeight: 600, "&:hover": { backgroundColor: "#14304f" } }}
        >
          Priority Inbox
        </Button>
      </Box>

      {/* Filter */}
      <FilterBar value={filter} onChange={handleFilterChange} />

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
            <Typography sx={{ color: "#aaa", fontSize: "0.9rem" }}>No notifications found</Typography>
          </Box>
        ) : (
          notifications.map((n) => (
            <NotificationCard
              key={n.ID}
              notification={n}
              viewed={viewed.has(n.ID)}
              onClick={handleView}
            />
          ))
        )}
      </Box>

      {/* Pagination */}
      {!loading && notifications.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Pagination
            count={Math.ceil(total / PAGE_SIZE) || 1}
            page={page}
            onChange={(_, v) => setPage(v)}
            size="small"
            sx={{ "& .MuiPaginationItem-root": { borderRadius: "8px" } }}
          />
        </Box>
      )}
    </Box>
  );
}
