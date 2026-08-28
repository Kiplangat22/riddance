/** `90` -> `"1h 30m"`, `45` -> `"45m"`. */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

/** `6.234` -> `"6.23 km"`. */
export function formatDistance(km: number): string {
  return `${km.toFixed(2).replace(/\.?0+$/, "")} km`;
}

/** ISO `YYYY-MM-DD` -> `"Sat, 15 Mar"`, with "Today" / "Yesterday" shortcuts. */
export function formatDate(isoDay: string, today = new Date()): string {
  const todayIso = toIsoDay(today);
  const yesterdayIso = toIsoDay(new Date(today.getTime() - 86_400_000));
  if (isoDay === todayIso) return "Today";
  if (isoDay === yesterdayIso) return "Yesterday";

  const parsed = new Date(`${isoDay}T00:00:00`);
  return parsed.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
}

export function toIsoDay(date: Date): string {
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 10);
}
