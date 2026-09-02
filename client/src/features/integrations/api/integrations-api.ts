import { API_BASE_URL } from "../../../lib/config";
import { apiRequest } from "../../../lib/http";

const BASE = `${API_BASE_URL}/api/v1`;

export interface ImportResult {
  imported: number;
  skipped: number;
  errors?: string[];
}

export interface StravaStatus {
  configured: boolean;
  connectUrl: string;
}

export const integrationsApi = {
  stravaStatus: (): Promise<StravaStatus> =>
    apiRequest(`${BASE}/integrations/strava/status`),

  importCSV: (csv: string): Promise<ImportResult> =>
    apiRequest(`${BASE}/import/csv`, {
      method: "POST",
      body: JSON.stringify({ csv }),
    }),

  importGPX: (gpx: string): Promise<ImportResult> =>
    apiRequest(`${BASE}/import/gpx`, {
      method: "POST",
      body: JSON.stringify({ gpx }),
    }),
};
