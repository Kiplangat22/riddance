import { useEffect, useState } from "react";
import type { ActivityStats } from "../types";

interface Goals {
  weeklyDistanceKm: number;
  weeklyDurationMinutes: number;
  weeklyActivities: number;
}

const STORAGE_KEY = "riddance:goals";

function loadGoals(): Goals {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Goals;
  } catch {
    // ignore
  }
  return { weeklyDistanceKm: 40, weeklyDurationMinutes: 300, weeklyActivities: 5 };
}

function saveGoals(goals: Goals) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
}

interface GoalsPanelProps {
  stats: ActivityStats | null;
}

function ProgressBar({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const done = pct >= 100;
  return (
    <div className="goal-row">
      <div className="goal-label-row">
        <span className="goal-label">{label}</span>
        <span className={`goal-pct ${done ? "goal-done" : ""}`}>{pct}%{done ? " ✓" : ""}</span>
      </div>
      <div className="goal-bar-track">
        <div
          className={`goal-bar-fill ${done ? "goal-bar-done" : ""}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function GoalsPanel({ stats }: GoalsPanelProps) {
  const [goals, setGoals] = useState<Goals>(loadGoals);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Goals>(goals);

  useEffect(() => { saveGoals(goals); }, [goals]);

  function applyDraft() {
    setGoals(draft);
    setEditing(false);
  }

  const week = stats?.thisWeek;

  return (
    <div className="goals-panel">
      <div className="goals-header">
        <h3>Weekly goals</h3>
        <button className="ghost-btn" onClick={() => { setDraft(goals); setEditing((e) => !e); }}>
          {editing ? "Cancel" : "Edit goals"}
        </button>
      </div>

      {editing ? (
        <div className="goals-edit">
          <label className="field">
            <span>Distance target (km)</span>
            <input
              type="number"
              min={0}
              step={1}
              value={draft.weeklyDistanceKm}
              onChange={(e) => setDraft((d) => ({ ...d, weeklyDistanceKm: Number(e.target.value) }))}
            />
          </label>
          <label className="field">
            <span>Time target (min)</span>
            <input
              type="number"
              min={0}
              step={15}
              value={draft.weeklyDurationMinutes}
              onChange={(e) => setDraft((d) => ({ ...d, weeklyDurationMinutes: Number(e.target.value) }))}
            />
          </label>
          <label className="field">
            <span>Activity count</span>
            <input
              type="number"
              min={1}
              step={1}
              value={draft.weeklyActivities}
              onChange={(e) => setDraft((d) => ({ ...d, weeklyActivities: Number(e.target.value) }))}
            />
          </label>
          <button className="primary-button" onClick={applyDraft}>Save goals</button>
        </div>
      ) : (
        <div className="goals-bars">
          <ProgressBar
            label={`Distance — ${week ? week.distanceKm.toFixed(1) : 0} / ${goals.weeklyDistanceKm} km`}
            value={week?.distanceKm ?? 0}
            max={goals.weeklyDistanceKm}
          />
          <ProgressBar
            label={`Time — ${week ? Math.round(week.durationMinutes) : 0} / ${goals.weeklyDurationMinutes} min`}
            value={week?.durationMinutes ?? 0}
            max={goals.weeklyDurationMinutes}
          />
          <ProgressBar
            label={`Sessions — ${week?.activities ?? 0} / ${goals.weeklyActivities}`}
            value={week?.activities ?? 0}
            max={goals.weeklyActivities}
          />
        </div>
      )}
    </div>
  );
}
