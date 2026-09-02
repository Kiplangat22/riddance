import { toIsoDay } from "../../../lib/format";
import type { Activity } from "../types";

interface WeekChartProps {
  activities: Activity[];
}

function getLast7Days(): { iso: string; label: string }[] {
  const days: { iso: string; label: string }[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86_400_000);
    days.push({
      iso: toIsoDay(d),
      label: d.toLocaleDateString(undefined, { weekday: "short" }),
    });
  }
  return days;
}

export function WeekChart({ activities }: WeekChartProps) {
  const days = getLast7Days();

  // Aggregate distance per day
  const distByDay: Record<string, number> = {};
  for (const a of activities) {
    if (days.some((d) => d.iso === a.date)) {
      distByDay[a.date] = (distByDay[a.date] ?? 0) + (a.distanceKm ?? 0);
    }
  }

  // Count activities per day
  const countByDay: Record<string, number> = {};
  for (const a of activities) {
    if (days.some((d) => d.iso === a.date)) {
      countByDay[a.date] = (countByDay[a.date] ?? 0) + 1;
    }
  }

  const maxDist = Math.max(...days.map((d) => distByDay[d.iso] ?? 0), 1);
  const todayIso = toIsoDay(new Date());

  const BAR_HEIGHT = 80;
  const BAR_WIDTH = 28;
  const GAP = 12;
  const CHART_W = days.length * (BAR_WIDTH + GAP) - GAP;

  return (
    <div className="week-chart">
      <h3>Last 7 days</h3>
      <svg
        viewBox={`0 0 ${CHART_W} ${BAR_HEIGHT + 28}`}
        width="100%"
        aria-label="7-day activity chart"
        role="img"
      >
        {days.map((day, i) => {
          const dist = distByDay[day.iso] ?? 0;
          const count = countByDay[day.iso] ?? 0;
          const barH = Math.max(dist > 0 ? 4 : (count > 0 ? 4 : 0), (dist / maxDist) * BAR_HEIGHT);
          const x = i * (BAR_WIDTH + GAP);
          const isToday = day.iso === todayIso;

          return (
            <g key={day.iso}>
              {/* Background track */}
              <rect
                x={x}
                y={0}
                width={BAR_WIDTH}
                height={BAR_HEIGHT}
                rx={4}
                fill={isToday ? "#f0ede8" : "#f7f4ef"}
              />
              {/* Activity bar */}
              {(dist > 0 || count > 0) && (
                <rect
                  x={x}
                  y={BAR_HEIGHT - barH}
                  width={BAR_WIDTH}
                  height={barH}
                  rx={4}
                  fill={isToday ? "#fa765b" : "#282442"}
                  opacity={0.85}
                />
              )}
              {/* Activity count dot */}
              {count > 0 && (
                <text
                  x={x + BAR_WIDTH / 2}
                  y={BAR_HEIGHT - barH - 5}
                  textAnchor="middle"
                  fontSize={9}
                  fill={isToday ? "#fa765b" : "#282442"}
                  fontFamily="DM Mono, monospace"
                >
                  {count}
                </text>
              )}
              {/* Day label */}
              <text
                x={x + BAR_WIDTH / 2}
                y={BAR_HEIGHT + 16}
                textAnchor="middle"
                fontSize={10}
                fill={isToday ? "#fa765b" : "#6b6678"}
                fontFamily="DM Mono, monospace"
                fontWeight={isToday ? "500" : "400"}
              >
                {day.label}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="chart-note">Bar height = distance · number = activity count · today highlighted</p>
    </div>
  );
}
