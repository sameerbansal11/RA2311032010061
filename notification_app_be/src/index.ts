import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();

// ─── Types ────────────────────────────────────────────────────────────────────

type Stack = "frontend" | "backend";
type Level = "debug" | "info" | "warn" | "error" | "fatal";
type Pkg = "cache" | "controller" | "cron_job" | "db" | "domain" |
           "handler" | "repository" | "route" | "service" |
           "auth" | "config" | "middleware" | "utils";

interface Notification {
  ID: string;
  Type: "Placement" | "Result" | "Event";
  Message: string;
  Timestamp: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

let cachedToken: string | null = null;
let tokenExpiry: number = 0;

async function getAuthToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && now < tokenExpiry - 60) return cachedToken;

  const res = await axios.post("http://20.207.122.201/evaluation-service/auth", {
    email: process.env.EMAIL,
    name: process.env.NAME,
    rollNo: process.env.ROLL_NO,
    accessCode: process.env.ACCESS_CODE,
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
  });

  cachedToken = res.data.access_token;
  tokenExpiry = res.data.expires_in;
  return cachedToken as string;
}

// ─── Logger ───────────────────────────────────────────────────────────────────

async function Log(stack: Stack, level: Level, pkg: Pkg, message: string): Promise<void> {
  try {
    const token = await getAuthToken();
    await axios.post(
      "http://20.207.122.201/evaluation-service/logs",
      { stack, level, package: pkg, message },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (_) {}
}

// ─── Priority Scoring ─────────────────────────────────────────────────────────

const TYPE_WEIGHT: Record<string, number> = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

function computeScore(n: Notification): number {
  const weight = TYPE_WEIGHT[n.Type] * 1_000_000_000_000;
  const recency = new Date(n.Timestamp).getTime();
  return weight + recency;
}

// ─── Heap (Efficient Top-N) ───────────────────────────────────────────────────

class MinHeap {
  private heap: Notification[] = [];

  private score(n: Notification) { return computeScore(n); }

  private swap(i: number, j: number) {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  private bubbleUp(i: number) {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.score(this.heap[parent]) > this.score(this.heap[i])) {
        this.swap(parent, i);
        i = parent;
      } else break;
    }
  }

  private bubbleDown(i: number) {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const l = 2 * i + 1, r = 2 * i + 2;
      if (l < n && this.score(this.heap[l]) < this.score(this.heap[smallest])) smallest = l;
      if (r < n && this.score(this.heap[r]) < this.score(this.heap[smallest])) smallest = r;
      if (smallest !== i) { this.swap(i, smallest); i = smallest; }
      else break;
    }
  }

  push(n: Notification) {
    this.heap.push(n);
    this.bubbleUp(this.heap.length - 1);
  }

  pop(): Notification | undefined {
    const top = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) { this.heap[0] = last; this.bubbleDown(0); }
    return top;
  }

  peek(): Notification | undefined { return this.heap[0]; }
  size(): number { return this.heap.length; }
}

// ─── Get Top N ────────────────────────────────────────────────────────────────

async function getTopN(n: number = 10): Promise<void> {
  await Log("backend", "info", "service", `Priority inbox requested for top ${n} notifications`);

  const token = await getAuthToken();
  await Log("backend", "debug", "auth", "Auth token acquired successfully");

  const res = await axios.get(
    "http://20.207.122.201/evaluation-service/notifications",
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const notifications: Notification[] = res.data.notifications;
  await Log("backend", "info", "service", `Fetched ${notifications.length} total notifications from API`);

  // Min-Heap of size N — efficient for continuous incoming notifications
  const heap = new MinHeap();

  for (const notif of notifications) {
    if (heap.size() < n) {
      heap.push(notif);
    } else if (heap.peek() && computeScore(notif) > computeScore(heap.peek()!)) {
      heap.pop();
      heap.push(notif);
      await Log("backend", "debug", "service", `Replaced lower priority notification with: [${notif.Type}] ${notif.Message}`);
    }
  }

  await Log("backend", "info", "service", `Top ${n} notifications computed using min-heap`);

  // Extract and sort descending (highest priority first)
  const results: Notification[] = [];
  while (heap.size() > 0) results.unshift(heap.pop()!);

  // ─── Output ────────────────────────────────────────────────────────────────

  console.log(`\n${"═".repeat(55)}`);
  console.log(`  TOP ${n} PRIORITY NOTIFICATIONS`);
  console.log(`${"═".repeat(55)}`);
  console.log(`  Priority Order: Placement > Result > Event`);
  console.log(`  Tiebreaker: Most recent timestamp wins`);
  console.log(`${"═".repeat(55)}\n`);

  results.forEach((notif, i) => {
    const rank = String(i + 1).padStart(2, " ");
    const type = notif.Type.padEnd(10, " ");
    const time = notif.Timestamp;
    console.log(`  ${rank}.  [${type}]  ${notif.Message.padEnd(30, " ")}  ${time}`);
  });

  console.log(`\n${"═".repeat(55)}\n`);
  await Log("backend", "info", "service", `Priority inbox output rendered for top ${n} notifications`);
}

// ─── Run ──────────────────────────────────────────────────────────────────────

getTopN(10).catch(async (err) => {
  await Log("backend", "fatal", "service", `Priority inbox crashed: ${err.message}`);
  process.exit(1);
});
