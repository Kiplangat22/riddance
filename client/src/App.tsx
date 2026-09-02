import { ActivityForm } from "./features/activities/components/ActivityForm";
import { ActivityList } from "./features/activities/components/ActivityList";
import { StatsPanel } from "./features/activities/components/StatsPanel";
import { GoalsPanel } from "./features/activities/components/GoalsPanel";
import { WeekChart } from "./features/activities/components/WeekChart";
import { IntegrationsPanel } from "./features/integrations/components/IntegrationsPanel";
import { useActivities } from "./features/activities/hooks/use-activities";
import { useApiStatus } from "./features/activities/hooks/use-api-status";

export default function App() {
  const apiStatus = useApiStatus();
  const { activities, stats, isLoading, error, filter, setFilter, reload, create, remove, update } =
    useActivities();

  return (
    <main className="app-shell">
      <nav className="nav" aria-label="Main navigation">
        <a className="brand" href="#top" aria-label="Riddance home">
          <span>r</span> riddance
        </a>
        <div className="nav-right">
          <a className="nav-link" href="#connect">Connect apps</a>
          <a className="nav-link" href="#log">Log</a>
          <span className={`api-status ${apiStatus}`}>
            <i /> API {apiStatus}
          </span>
        </div>
      </nav>

      <header className="hero" id="top">
        <p className="eyebrow">Remove weakness · build discipline</p>
        <h1>
          Your training,
          <br />
          <em>one honest log at a time.</em>
        </h1>
        <p className="intro">
          Track every run, ride, walk, workout and night of sleep. Connect Strava, import GPX or CSV
          from any app, watch the streak grow and let the weekly numbers keep you accountable.
        </p>
      </header>

      {/* Stats + Goals side by side */}
      <div className="dashboard-row">
        <section className="panel panel-flex">
          <StatsPanel stats={stats} />
        </section>
        <section className="panel panel-goals">
          <GoalsPanel stats={stats} />
        </section>
      </div>

      {/* 7-day chart */}
      <section className="panel">
        <WeekChart activities={activities} />
      </section>

      {/* Health app integrations */}
      <section className="panel" id="connect">
        <div className="panel-heading">
          <h2>Connect health apps</h2>
          <p className="panel-sub">Import from Strava, Apple Health, Garmin, Google Fit or any CSV / GPX file.</p>
        </div>
        <IntegrationsPanel onImportComplete={() => void reload()} />
      </section>

      {/* Manual log */}
      <section className="panel" id="log">
        <div className="panel-heading">
          <h2>Log an activity</h2>
        </div>
        <ActivityForm onSubmit={create} />

        {error && (
          <div className="error-state" role="alert">
            {error} <button onClick={() => void reload()}>Retry</button>
          </div>
        )}

        <ActivityList
          activities={activities}
          isLoading={isLoading}
          filter={filter}
          onFilterChange={setFilter}
          onRemove={remove}
          onUpdate={update}
        />
      </section>

      <footer>
        <span>© {new Date().getFullYear()} Riddance</span>
        <span>Remove weakness. Build discipline.</span>
      </footer>
    </main>
  );
}
