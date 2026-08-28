import { useState } from "react";
import { toIsoDay } from "../../../lib/format";
import { activityTypes, typeSupportsDistance } from "../types";
import type { ActivityType, CreateActivityInput } from "../types";

interface ActivityFormProps {
  onSubmit: (input: CreateActivityInput) => Promise<void>;
}

const defaultTitleFor: Record<ActivityType, string> = {
  Run: "Easy run",
  Walk: "Walk",
  Ride: "Bike ride",
  Workout: "Strength session",
  Sleep: "Night's sleep",
  Meditation: "Meditation",
};

export function ActivityForm({ onSubmit }: ActivityFormProps) {
  const [type, setType] = useState<ActivityType>("Run");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(() => toIsoDay(new Date()));
  const [duration, setDuration] = useState("");
  const [distance, setDistance] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const showDistance = typeSupportsDistance(type);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const durationMinutes = Number(duration);
    if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) return;

    const input: CreateActivityInput = {
      type,
      title: title.trim() || defaultTitleFor[type],
      date,
      durationMinutes: Math.round(durationMinutes),
      distanceKm: showDistance && distance ? Number(distance) : null,
      notes: notes.trim() || null,
    };

    setSubmitting(true);
    try {
      await onSubmit(input);
      setTitle("");
      setDuration("");
      setDistance("");
      setNotes("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="log-form" onSubmit={handleSubmit}>
      <div className="log-form-row">
        <label className="field">
          <span>Activity</span>
          <select value={type} onChange={(event) => setType(event.target.value as ActivityType)}>
            {activityTypes.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>

        <label className="field field-grow">
          <span>Title</span>
          <input
            value={title}
            maxLength={120}
            placeholder={defaultTitleFor[type]}
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>

        <label className="field">
          <span>Date</span>
          <input type="date" value={date} max={toIsoDay(new Date())} onChange={(event) => setDate(event.target.value)} />
        </label>
      </div>

      <div className="log-form-row">
        <label className="field">
          <span>Duration (min)</span>
          <input
            type="number"
            min={1}
            inputMode="numeric"
            value={duration}
            placeholder="30"
            onChange={(event) => setDuration(event.target.value)}
            required
          />
        </label>

        {showDistance && (
          <label className="field">
            <span>Distance (km)</span>
            <input
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              value={distance}
              placeholder="5.0"
              onChange={(event) => setDistance(event.target.value)}
            />
          </label>
        )}

        <label className="field field-grow">
          <span>Notes</span>
          <input
            value={notes}
            maxLength={1000}
            placeholder="How did it feel?"
            onChange={(event) => setNotes(event.target.value)}
          />
        </label>

        <button className="primary-button" type="submit" disabled={submitting}>
          {submitting ? "Saving…" : "Log it"} <span>+</span>
        </button>
      </div>
    </form>
  );
}
