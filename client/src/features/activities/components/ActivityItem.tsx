import { useState } from "react";
import { formatDate, formatDistance, formatDuration } from "../../../lib/format";
import type { Activity, UpdateActivityInput } from "../types";
import { EditActivityModal } from "./EditActivityModal";

interface ActivityItemProps {
  activity: Activity;
  onRemove: (id: string) => void;
  onUpdate: (id: string, input: UpdateActivityInput) => Promise<void>;
}

const typeGlyph: Record<Activity["type"], string> = {
  Run: "🏃",
  Walk: "🚶",
  Ride: "🚴",
  Workout: "💪",
  Sleep: "😴",
  Meditation: "🧘",
};

const sourceBadge: Record<string, string> = {
  strava: "Strava",
  csv: "CSV",
  gpx: "GPX",
};

export function ActivityItem({ activity, onRemove, onUpdate }: ActivityItemProps) {
  const [editing, setEditing] = useState(false);

  return (
    <>
      <article className="activity-item">
        <span className="activity-glyph" aria-hidden="true">
          {typeGlyph[activity.type]}
        </span>

        <div className="activity-copy">
          <h3>
            {activity.title}
            {activity.source && activity.source !== "manual" && (
              <span className="source-badge">{sourceBadge[activity.source] ?? activity.source}</span>
            )}
          </h3>
          <p className="activity-meta">
            <span className="activity-type">{activity.type}</span>
            <span>{formatDate(activity.date)}</span>
            <span>{formatDuration(activity.durationMinutes)}</span>
            {activity.distanceKm != null && <span>{formatDistance(activity.distanceKm)}</span>}
          </p>
          {activity.notes && <p className="activity-notes">{activity.notes}</p>}
        </div>

        <div className="activity-actions">
          <button
            className="edit"
            onClick={() => setEditing(true)}
            aria-label={`Edit ${activity.title}`}
          >
            ✎
          </button>
          <button
            className="remove"
            onClick={() => onRemove(activity.id)}
            aria-label={`Delete ${activity.title}`}
          >
            ×
          </button>
        </div>
      </article>

      {editing && (
        <EditActivityModal
          activity={activity}
          onSave={onUpdate}
          onClose={() => setEditing(false)}
        />
      )}
    </>
  );
}
