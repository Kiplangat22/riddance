import { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { useReleases } from "./features/releases/hooks/use-releases.js";
import "./styles.css";

const categories = ["Digital", "Home", "Work", "Mindset", "Boundaries"];

function App() {
  const { items, isLoading, error, reload, create, toggle, remove } = useReleases();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [apiStatus, setApiStatus] = useState("checking");
  const [showComplete, setShowComplete] = useState(false);
  useEffect(() => { fetch("/api/v1/health").then((response) => response.ok ? response.json() : Promise.reject()).then(() => setApiStatus("online")).catch(() => setApiStatus("offline")); }, []);
  const remaining = items.filter((item) => !item.completed).length;
  const completed = items.length - remaining;
  const progress = items.length ? Math.round((completed / items.length) * 100) : 0;
  const visibleItems = showComplete ? items : items.filter((item) => !item.completed);
  const encouragement = useMemo(() => !items.length ? "A clean slate looks good on you." : !remaining ? "Everything on your list has been released." : completed ? "Small releases make meaningful space." : "Start with the thing that feels heaviest.", [items.length, remaining, completed]);
  function addItem(event) { event.preventDefault(); const trimmed = title.trim(); if (!trimmed) return; void create({ title: trimmed, category }); setTitle(""); }
  return <main className="app-shell">
    <nav className="nav" aria-label="Main navigation"><a className="brand" href="#top" aria-label="Riddance home"><span>r</span> riddance</a><div className="nav-right"><span className={`api-status ${apiStatus}`}><i /> API {apiStatus}</span><a href="#release">Your release list</a></div></nav>
    <section className="hero" id="top"><div className="hero-copy"><p className="eyebrow">A little less, on purpose</p><h1>Make room for<br /><em>better things.</em></h1><p className="intro">Riddance is a calm place to name what has outlived its usefulness—and let it go, one small decision at a time.</p><a className="primary-button" href="#release">Start releasing <span>↓</span></a></div><div className="hero-art" aria-hidden="true"><div className="orb orb-one" /><div className="orb orb-two" /><div className="orb orb-three" /><div className="paper-card"><span className="paper-spark">✦</span><p>more room<br />to breathe</p><span className="paper-line" /></div></div></section>
    <section className="release-section" id="release"><div className="section-heading"><div><p className="eyebrow">Your release list</p><h2>What are you ready to<br />say goodbye to?</h2></div><div className="progress-wrap"><div className="progress-label"><span>{completed} released</span><strong>{progress}%</strong></div><div className="progress-track"><span style={{ width: `${progress}%` }} /></div></div></div>
      <form className="add-form" onSubmit={addItem}><label className="sr-only" htmlFor="release-title">Something to let go of</label><input id="release-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Name something you’re ready to release…" maxLength="120" /><select aria-label="Category" value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((name) => <option key={name}>{name}</option>)}</select><button type="submit">Add <span>+</span></button></form>
      <div className="list-toolbar"><p>{encouragement}</p><button className="text-button" onClick={() => setShowComplete((value) => !value)}>{showComplete ? "Hide released" : `Show released (${completed})`}</button></div>
      {error && <div className="error-state" role="alert">{error} <button onClick={() => void reload()}>Try again</button></div>}
      <div className="release-list">{isLoading && <div className="empty-state"><span>✦</span><p>Loading your release list…</p></div>}{!isLoading && visibleItems.map((item) => <article className={`release-item ${item.completed ? "done" : ""}`} key={item.id}><button className="check" onClick={() => void toggle(item)} aria-label={item.completed ? `Restore ${item.title}` : `Release ${item.title}`}>{item.completed && "✓"}</button><div className="item-copy"><h3>{item.title}</h3><span>{item.category}</span></div><button className="remove" onClick={() => void remove(item.id)} aria-label={`Remove ${item.title}`}>×</button></article>)}{!isLoading && !visibleItems.length && <div className="empty-state"><span>✦</span><p>Nothing here right now. That can be a good thing.</p></div>}</div>
    </section>
    <section className="ritual"><p className="eyebrow">The Riddance ritual</p><div className="ritual-grid"><p><b>01</b> Notice what takes up more space than it deserves.</p><p><b>02</b> Name it without needing to justify the feeling.</p><p><b>03</b> Release it, and choose what gets the space instead.</p></div></section><footer><span>© {new Date().getFullYear()} Riddance</span><span>Less noise. More you.</span></footer>
  </main>;
}
createRoot(document.getElementById("root")).render(<App />);
