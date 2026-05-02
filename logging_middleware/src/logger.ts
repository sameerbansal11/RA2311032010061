import axios from "axios";
import { getAuthToken } from "./auth";

type Stack = "frontend" | "backend";
type Level = "debug" | "info" | "warn" | "error" | "fatal";
type BackendPackage = "cache" | "controller" | "cron_job" | "db" | "domain" | "handler" | "repository" | "route" | "service";
type FrontendPackage = "api" | "component" | "hook" | "page" | "state" | "style";
type SharedPackage = "auth" | "config" | "middleware" | "utils";
type Package = BackendPackage | FrontendPackage | SharedPackage;

export async function Log(
  stack: Stack,
  level: Level,
  pkg: Package,
  message: string
): Promise<void> {
  try {
    const token = await getAuthToken();

    await axios.post(
      "http://20.207.122.201/evaluation-service/logs",
      {
        stack,
        level,
        package: pkg,
        message,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (_) {
    // Fail silently — never use console.log as per assignment rules
  }
}
