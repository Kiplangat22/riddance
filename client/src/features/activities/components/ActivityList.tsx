import { activityTypes } from "../types";
import type { Activity, ActivityType, UpdateActivityInput } from "../types";
import { ActivityItem } from "./ActivityItem";

interface ActivityListProps {
  activities: Activity[];
  isLoading: boolean;
  filter: ActivityType | "All";
  onFilterChange: (filter: ActivityType | "All") => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, input: UpdateActivityInput) => Promise<void>;
}

const filters: Array<ActivityType | "All"> = ["All", ...activityTypes];

export function ActivityList({ activities, isLoading, filter, onFilterChange, onRemove, onUpdate }: ActivityListProps) {
  return (
    <div className="activity-log">
      <div className="filter-bar" role="tablist" aria-label="Filter activities">
        {filters.map((name) => (
          <button
            key={name}
            role="tab"
            aria-selected={filter === name}
            className={`chip ${filter === name ? "chip-active" : ""}`}
            onClick={() => onFilterChange(name)}
          >
            {name}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="empty-state">Loading your log…</p>
      ) : activities.length === 0 ? (
        <p className="empty-state">
          <span>✦</span> Nothing logged yet. Add your first session above.
        </p>
      ) : (
        <div className="activity-items">
          {activities.map((activity) => (
            <ActivityItem
              key={activity.id}
              activity={activity}
              onRemove={onRemove}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
