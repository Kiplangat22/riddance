import { useCallback, useEffect, useState } from "react";
import { releaseApi } from "../api/release-api.js";

export function useReleases() {
  const [items, setItems] = useState([]); const [isLoading, setIsLoading] = useState(true); const [error, setError] = useState("");
  const load = useCallback(async () => { setIsLoading(true); setError(""); try { setItems(await releaseApi.list()); } catch (error) { setError(error.message); } finally { setIsLoading(false); } }, []);
  useEffect(() => { void load(); }, [load]);
  async function run(operation) { setError(""); try { await operation(); } catch (error) { setError(error.message); } }
  return { items, isLoading, error, reload: load,
    create: (input) => run(async () => setItems((current) => [await releaseApi.create(input), ...current])),
    toggle: (item) => run(async () => { const updated = await releaseApi.update(item.id, { completed: !item.completed }); setItems((current) => current.map((entry) => entry.id === item.id ? updated : entry)); }),
    remove: (id) => run(async () => { await releaseApi.remove(id); setItems((current) => current.filter((item) => item.id !== id)); }),
  };
}
