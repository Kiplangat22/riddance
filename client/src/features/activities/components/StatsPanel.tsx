import { formatDistance, formatDuration } from "../../../lib/format";
import type { ActivityStats } from "../types";

interface StatsPanelProps {
  stats: ActivityStats | null;
}

export function StatsPanel({ stats }: StatsPanelProps) {
  const week = stats?.thisWeek;

  const tiles = [
    { label: "Current streak", value: stats ? `${stats.currentStreakDays}` : "–", unit: "days" },
    { label: "This week", value: week ? `${week.activities}` : "–", unit: "activities" },
    { label: "Weekly distance", value: week ? formatDistance(week.distanceKm) : "–", unit: "" },
    { label: "Weekly time", value: week ? formatDuration(week.durationMinutes) : "–", unit: "" },
  ];

  return (
    <div className="stats-panel">
      <div className="stats-row">
        {tiles.map((tile) => (
          <div className="stat-tile" key={tile.label}>
            <span className="stat-label">{tile.label}</span>
            <strong className="stat-value">{tile.value}</strong>
            {tile.unit && <span className="stat-unit">{tile.unit}</span>}
          </div>
        ))}
      </div>

      {stats && stats.byType.length > 0 && (
        <ul className="type-breakdown">
          {stats.byType.map((entry) => (
            <li key={entry.type}>
              <span className="type-name">{entry.type}</span>
              <span className="type-detail">
                {entry.count}× · {formatDuration(entry.durationMinutes)}
                {entry.distanceKm > 0 && ` · ${formatDistance(entry.distanceKm)}`}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
