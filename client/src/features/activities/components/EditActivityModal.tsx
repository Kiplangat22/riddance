import { useEffect, useState } from "react";
import { toIsoDay } from "../../../lib/format";
import { activityTypes, typeSupportsDistance } from "../types";
import type { Activity, ActivityType, UpdateActivityInput } from "../types";

interface EditActivityModalProps {
  activity: Activity;
  onSave: (id: string, input: UpdateActivityInput) => Promise<void>;
  onClose: () => void;
}

export function EditActivityModal({ activity, onSave, onClose }: EditActivityModalProps) {
  const [type, setType] = useState<ActivityType>(activity.type);
  const [title, setTitle] = useState(activity.title);
  const [date, setDate] = useState(activity.date);
  const [duration, setDuration] = useState(String(activity.durationMinutes));
  const [distance, setDistance] = useState(activity.distanceKm != null ? String(activity.distanceKm) : "");
  const [notes, setNotes] = useState(activity.notes ?? "");
  const [saving, setSaving] = useState(false);

  const showDistance = typeSupportsDistance(type);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const durationMinutes = Number(duration);
    if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) return;

    setSaving(true);
    try {
      await onSave(activity.id, {
        type,
        title: title.trim() || activity.title,
        date,
        durationMinutes: Math.round(durationMinutes),
        distanceKm: showDistance && distance ? Number(distance) : null,
        notes: notes.trim() || null,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" role="dialog" aria-label="Edit activity" aria-modal="true">
        <div className="modal-header">
          <h2>Edit activity</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <form className="log-form" onSubmit={handleSubmit}>
          <div className="log-form-row">
            <label className="field">
              <span>Activity</span>
              <select value={type} onChange={(e) => setType(e.target.value as ActivityType)}>
                {activityTypes.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </label>

            <label className="field field-grow">
              <span>Title</span>
              <input
                value={title}
                maxLength={120}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>

            <label className="field">
              <span>Date</span>
              <input
                type="date"
                value={date}
                max={toIsoDay(new Date())}
                onChange={(e) => setDate(e.target.value)}
              />
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
                onChange={(e) => setDuration(e.target.value)}
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
                  onChange={(e) => setDistance(e.target.value)}
                />
              </label>
            )}

            <label className="field field-grow">
              <span>Notes</span>
              <input
                value={notes}
                maxLength={1000}
                onChange={(e) => setNotes(e.target.value)}
              />
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
            <button className="primary-button" type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
