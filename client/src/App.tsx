import { ActivityForm } from "./features/activities/components/ActivityForm";
import { ActivityList } from "./features/activities/components/ActivityList";
import { StatsPanel } from "./features/activities/components/StatsPanel";
import { useActivities } from "./features/activities/hooks/use-activities";
import { useApiStatus } from "./features/activities/hooks/use-api-status";

export default function App() {
  const apiStatus = useApiStatus();
  const { activities, stats, isLoading, error, filter, setFilter, reload, create, remove } =
    useActivities();

  return (
    <main className="app-shell">
      <nav className="nav" aria-label="Main navigation">
        <a className="brand" href="#top" aria-label="Riddance home">
          <span>r</span> riddance
        </a>
        <span className={`api-status ${apiStatus}`}>
          <i /> API {apiStatus}
        </span>
      </nav>

      <header className="hero" id="top">
        <p className="eyebrow">Remove weakness · build discipline</p>
        <h1>
          Your training,
          <br />
          <em>one honest log at a time.</em>
        </h1>
        <p className="intro">
          Track every run, ride, walk, workout and night of sleep. Watch the streak grow and let the
          weekly numbers keep you accountable.
        </p>
      </header>

      <section className="panel">
        <StatsPanel stats={stats} />
      </section>

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
        />
      </section>

      <footer>
        <span>© {new Date().getFullYear()} Riddance</span>
        <span>Remove weakness. Build discipline.</span>
      </footer>
    </main>
  );
}
