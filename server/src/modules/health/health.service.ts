import { env } from "../../config/env.js";

export default function getHealthStatus() {
  return {
    success: true,
    status: "ok",
    service: "riddance-api",
    environment: env.NODE_ENV,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  };
}
