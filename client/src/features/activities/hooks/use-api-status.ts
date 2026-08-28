import { useEffect, useState } from "react";

export type ApiStatus = "checking" | "online" | "offline";

/** Polls the health endpoint once on mount so the header can show API state. */
export function useApiStatus(): ApiStatus {
  const [status, setStatus] = useState<ApiStatus>("checking");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/v1/health")
      .then((response) => {
        if (!cancelled) setStatus(response.ok ? "online" : "offline");
      })
      .catch(() => {
        if (!cancelled) setStatus("offline");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return status;
}
