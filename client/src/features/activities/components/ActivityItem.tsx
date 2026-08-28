import { formatDate, formatDistance, formatDuration } from "../../../lib/format";
import type { Activity } from "../types";

interface ActivityItemProps {
  activity: Activity;
  onRemove: (id: string) => void;
}

const typeGlyph: Record<Activity["type"], string> = {
  Run: "🏃",
  Walk: "🚶",
  Ride: "🚴",
  Workout: "💪",
  Sleep: "😴",
  Meditation: "🧘",
};

export function ActivityItem({ activity, onRemove }: ActivityItemProps) {
  return (
    <article className="activity-item">
      <span className="activity-glyph" aria-hidden="true">
        {typeGlyph[activity.type]}
      </span>

      <div className="activity-copy">
        <h3>{activity.title}</h3>
        <p className="activity-meta">
          <span className="activity-type">{activity.type}</span>
          <span>{formatDate(activity.date)}</span>
          <span>{formatDuration(activity.durationMinutes)}</span>
          {activity.distanceKm != null && <span>{formatDistance(activity.distanceKm)}</span>}
        </p>
        {activity.notes && <p className="activity-notes">{activity.notes}</p>}
      </div>

      <button
        className="remove"
        onClick={() => onRemove(activity.id)}
        aria-label={`Delete ${activity.title}`}
      >
        ×
      </button>
    </article>
  );
}
