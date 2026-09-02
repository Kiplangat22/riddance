import type { ActivityType } from "../activities/activity.types.js";
import type { ActivityRepository } from "../activities/activity.repository.js";

export interface ImportRow {
  type: ActivityType;
  title: string;
  date: string;
  durationMinutes: number;
  distanceKm?: number | null;
  notes?: string | null;
}

export interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

const VALID_TYPES = new Set<ActivityType>([
  "Run", "Walk", "Ride", "Workout", "Sleep", "Meditation",
]);

function normaliseType(raw: string): ActivityType | null {
  const t = raw.trim();
  const capitalised = t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
  if (VALID_TYPES.has(capitalised as ActivityType)) return capitalised as ActivityType;
  // fuzzy
  if (/run|jog/i.test(t)) return "Run";
  if (/walk|hike/i.test(t)) return "Walk";
  if (/ride|bike|cycl/i.test(t)) return "Ride";
  if (/workout|gym|strength|weight|cross/i.test(t)) return "Workout";
  if (/sleep|rest/i.test(t)) return "Sleep";
  if (/meditat|yoga|mindful/i.test(t)) return "Meditation";
  return null;
}

// ── CSV parser ─────────────────────────────────────────────────────────────

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

export function parseCSV(text: string): ImportRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]!).map((h) => h.toLowerCase().replace(/\s+/g, "_"));

  const col = (row: string[], name: string, alt?: string) => {
    const idx = headers.indexOf(name) === -1 && alt ? headers.indexOf(alt) : headers.indexOf(name);
    return idx === -1 ? "" : (row[idx] ?? "");
  };

  const rows: ImportRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = parseCSVLine(lines[i]!);
    const type = normaliseType(col(cells, "type", "activity_type"));
    if (!type) continue;

    const title = col(cells, "title", "name") || `Imported ${type}`;
    const date = col(cells, "date", "start_date").slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;

    const durationRaw =
      col(cells, "duration_minutes", "duration") ||
      col(cells, "moving_time_minutes", "moving_time");
    const durationMinutes = Math.round(parseFloat(durationRaw));
    if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) continue;

    const distRaw = col(cells, "distance_km", "distance");
    const distanceKm = distRaw ? parseFloat(distRaw) : null;

    rows.push({
      type,
      title,
      date,
      durationMinutes,
      distanceKm: distanceKm && Number.isFinite(distanceKm) ? distanceKm : null,
      notes: col(cells, "notes", "description") || null,
    });
  }
  return rows;
}

// ── GPX parser ─────────────────────────────────────────────────────────────

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function parseGPX(xml: string): ImportRow | null {
  // Extract track name
  const nameMatch = xml.match(/<name>([^<]+)<\/name>/);
  const title = nameMatch ? nameMatch[1]!.trim() : "GPX import";

  // Extract activity type from <type>
  const typeTagMatch = xml.match(/<type>([^<]+)<\/type>/);
  const activityType = typeTagMatch ? normaliseType(typeTagMatch[1]!) ?? "Run" : "Run";

  // Extract trackpoints
  const trkptRegex = /<trkpt[^>]+lat="([^"]+)"[^>]+lon="([^"]+)"[^>]*>[\s\S]*?(?:<time>([^<]+)<\/time>)?[\s\S]*?<\/trkpt>/g;
  const points: { lat: number; lon: number; time?: Date }[] = [];

  let match: RegExpExecArray | null;
  while ((match = trkptRegex.exec(xml)) !== null) {
    const lat = parseFloat(match[1]!);
    const lon = parseFloat(match[2]!);
    const timeStr = match[3];
    points.push({ lat, lon, time: timeStr ? new Date(timeStr) : undefined });
  }

  if (points.length < 2) return null;

  // Calculate total distance
  let distanceKm = 0;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]!;
    const curr = points[i]!;
    distanceKm += haversineKm(prev.lat, prev.lon, curr.lat, curr.lon);
  }

  // Calculate duration
  const first = points[0]!;
  const last = points[points.length - 1]!;
  let durationMinutes = 30; // fallback
  if (first.time && last.time) {
    durationMinutes = Math.max(1, Math.round((last.time.getTime() - first.time.getTime()) / 60000));
  }

  const date = first.time ? first.time.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);

  return {
    type: activityType,
    title,
    date,
    durationMinutes,
    distanceKm: parseFloat(distanceKm.toFixed(2)),
  };
}

// ── Batch importer ─────────────────────────────────────────────────────────

export async function importRows(
  rows: ImportRow[],
  repository: ActivityRepository,
): Promise<ImportResult> {
  const result: ImportResult = { imported: 0, skipped: 0, errors: [] };
  for (const row of rows) {
    try {
      await repository.create(row);
      result.imported++;
    } catch (err) {
      result.skipped++;
      result.errors.push(String(err));
    }
  }
  return result;
}
