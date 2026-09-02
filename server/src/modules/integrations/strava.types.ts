export interface StravaTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  athlete: { id: number; firstname: string; lastname: string };
}

export interface StravaActivity {
  id: number;
  name: string;
  type: string;
  sport_type: string;
  start_date_local: string; // ISO datetime e.g. "2024-01-15T07:30:00Z"
  moving_time: number; // seconds
  distance: number; // meters
  private: boolean;
}

export interface ImportResult {
  imported: number;
  skipped: number;
  errors: number;
}
