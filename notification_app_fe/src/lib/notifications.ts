import { getAuthToken } from "./auth";

export interface Notification {
  ID: string;
  Type: "Placement" | "Result" | "Event";
  Message: string;
  Timestamp: string;
}

export type NotificationType = "All" | "Placement" | "Result" | "Event";

const TYPE_WEIGHT: Record<string, number> = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

export function computeScore(n: Notification): number {
  return TYPE_WEIGHT[n.Type] * 1_000_000_000_000 + new Date(n.Timestamp).getTime();
}

export async function fetchNotifications(params?: {
  limit?: number;
  page?: number;
  notification_type?: string;
}): Promise<Notification[]> {
  const token = await getAuthToken();
  const query = new URLSearchParams();
  const limit = params?.limit && params.limit <= 10 ? params.limit : 10;
  query.set("limit", String(limit));
  if (params?.page) query.set("page", String(params.page));
  if (params?.notification_type && params.notification_type !== "All")
    query.set("notification_type", params.notification_type);

  const res = await fetch(`/api/proxy/notifications?${query.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  if (Array.isArray(data?.notifications)) return data.notifications;
  if (Array.isArray(data)) return data;
  return [];
}

export async function fetchAllNotifications(): Promise<Notification[]> {
  const all: Notification[] = [];
  let page = 1;

  while (true) {
    const batch = await fetchNotifications({ limit: 10, page });
    if (!batch || batch.length === 0) break;
    all.push(...batch);
    if (batch.length < 10) break; // last page
    page++;
    if (page > 20) break; // safety cap — max 200 notifications
  }

  return all;
}

export function getTopN(notifications: Notification[], n: number): Notification[] {
  if (!Array.isArray(notifications) || notifications.length === 0) return [];
  return [...notifications].sort((a, b) => computeScore(b) - computeScore(a)).slice(0, n);
}
