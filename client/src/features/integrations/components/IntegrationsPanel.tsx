import { useEffect, useRef, useState } from "react";
import { integrationsApi } from "../api/integrations-api";

interface IntegrationsPanelProps {
  onImportComplete: () => void;
}

type StravaState = "idle" | "configured" | "not-configured" | "loading";
type ImportState = "idle" | "uploading" | "success" | "error";

interface ImportFeedback {
  imported: number;
  skipped: number;
  file: string;
}

export function IntegrationsPanel({ onImportComplete }: IntegrationsPanelProps) {
  const [stravaState, setStravaState] = useState<StravaState>("loading");
  const [importState, setImportState] = useState<ImportState>("idle");
  const [importFeedback, setImportFeedback] = useState<ImportFeedback | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Check Strava config status on mount
  useEffect(() => {
    integrationsApi
      .stravaStatus()
      .then((s) => setStravaState(s.configured ? "configured" : "not-configured"))
      .catch(() => setStravaState("not-configured"));
  }, []);

  // Handle Strava OAuth redirect params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const strava = params.get("strava");
    if (!strava) return;

    // Clean up URL
    const clean = new URL(window.location.href);
    clean.searchParams.delete("strava");
    clean.searchParams.delete("imported");
    clean.searchParams.delete("skipped");
    window.history.replaceState(null, "", clean.toString());

    if (strava === "synced") {
      const imported = Number(params.get("imported") ?? 0);
      const skipped = Number(params.get("skipped") ?? 0);
      setImportFeedback({ imported, skipped, file: "Strava" });
      setImportState("success");
      onImportComplete();
    } else if (strava === "denied") {
      setImportError("Strava access was denied.");
      setImportState("error");
    } else if (strava === "error") {
      setImportError("Strava sync failed. Check server logs.");
      setImportState("error");
    }
  }, [onImportComplete]);

  async function handleFile(file: File) {
    setImportState("uploading");
    setImportFeedback(null);
    setImportError(null);

    try {
      const text = await file.text();
      let result;

      if (file.name.endsWith(".gpx")) {
        result = await integrationsApi.importGPX(text);
      } else if (file.name.endsWith(".csv")) {
        result = await integrationsApi.importCSV(text);
      } else {
        throw new Error("Unsupported file type. Use .csv or .gpx");
      }

      setImportFeedback({ imported: result.imported, skipped: result.skipped, file: file.name });
      setImportState("success");
      onImportComplete();
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Import failed");
      setImportState("error");
    }
  }

  function onFilePicked(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
    e.target.value = "";
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) void handleFile(file);
  }

  const uploading = importState === "uploading";

  return (
    <div className="integrations-panel">
      <div className="integrations-grid">
        {/* Strava */}
        <div className="integration-card strava-card">
          <div className="integration-card-header">
            <svg className="integration-logo" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
            </svg>
            <span className="integration-name">Strava</span>
          </div>
          <p className="integration-desc">
            Import your runs, rides and workouts directly from Strava.
          </p>
          {stravaState === "loading" && <span className="integration-status">Checking…</span>}
          {stravaState === "not-configured" && (
            <span className="integration-status warn">
              Set STRAVA_CLIENT_ID + STRAVA_CLIENT_SECRET in server/.env
            </span>
          )}
          {stravaState === "configured" && (
            <a className="integration-btn strava-btn" href="/api/v1/integrations/strava/connect">
              Connect Strava
            </a>
          )}
        </div>

        {/* Google Fit */}
        <div className="integration-card">
          <div className="integration-card-header">
            <svg className="integration-logo" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="#EA4335" opacity=".15" />
              <path d="M12 7v5l3.5 2" stroke="#EA4335" strokeWidth="2" strokeLinecap="round" />
              <circle cx="12" cy="12" r="10" stroke="#4285F4" strokeWidth="1.5" fill="none" />
            </svg>
            <span className="integration-name">Google Fit</span>
          </div>
          <p className="integration-desc">
            Export your Google Fit data as CSV and import it below.
          </p>
          <a
            className="integration-btn"
            href="https://takeout.google.com/"
            target="_blank"
            rel="noreferrer"
          >
            Export from Google Takeout
          </a>
        </div>

        {/* Apple Health */}
        <div className="integration-card">
          <div className="integration-card-header">
            <svg className="integration-logo" viewBox="0 0 24 24" fill="currentColor" style={{ color: "#ff3b30" }}>
              <path d="M12 21.593c-.725-.725-7.5-6.713-7.5-11.593 0-3.038 2.462-5.5 5.5-5.5 1.357 0 2.598.488 3.5 1.293.902-.805 2.143-1.293 3.5-1.293 3.038 0 5.5 2.462 5.5 5.5 0 4.88-6.775 10.868-7.5 11.593z" />
            </svg>
            <span className="integration-name">Apple Health</span>
          </div>
          <p className="integration-desc">
            On iPhone: Health app → Profile → Export All Health Data → share the CSV files here.
          </p>
          <button
            className="integration-btn"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            Upload Export
          </button>
        </div>

        {/* Garmin */}
        <div className="integration-card">
          <div className="integration-card-header">
            <svg className="integration-logo" viewBox="0 0 24 24" fill="currentColor" style={{ color: "#007DC3" }}>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
            </svg>
            <span className="integration-name">Garmin Connect</span>
          </div>
          <p className="integration-desc">
            Garmin Connect → Activities → Export as GPX or CSV, then upload below.
          </p>
          <button
            className="integration-btn"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            Upload GPX / CSV
          </button>
        </div>
      </div>

      {/* File drop zone */}
      <div
        className={`drop-zone ${dragging ? "drag-over" : ""} ${uploading ? "uploading" : ""}`}
        onDragEnter={(e) => { e.preventDefault(); setDragging(true); }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !uploading && fileRef.current?.click()}
        role="button"
        aria-label="Drop CSV or GPX file to import"
      >
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.gpx"
          style={{ display: "none" }}
          onChange={onFilePicked}
        />
        {uploading ? (
          <p>Importing…</p>
        ) : (
          <>
            <p>Drop a <strong>.csv</strong> or <strong>.gpx</strong> file here, or click to browse</p>
            <span className="drop-hint">Supports: Garmin GPX, Apple Health CSV, Strava CSV export</span>
          </>
        )}
      </div>

      {importState === "success" && importFeedback && (
        <div className="import-feedback success">
          {importFeedback.imported} activit{importFeedback.imported === 1 ? "y" : "ies"} imported
          from {importFeedback.file}
          {importFeedback.skipped > 0 && ` (${importFeedback.skipped} skipped / duplicates)`}.
        </div>
      )}
      {importState === "error" && importError && (
        <div className="import-feedback error">{importError}</div>
      )}
    </div>
  );
}
