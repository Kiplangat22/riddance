/**
 * Base URL for the RIDDANCE API.
 *
 * - Local dev: leave `VITE_API_URL` unset. Requests go to `/api/...` and Vite's
 *   dev-server proxy forwards them to `http://localhost:5000`.
 * - Production: set `VITE_API_URL` to the deployed API origin
 *   (e.g. `https://riddance-api.onrender.com`).
 */
export const API_BASE_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");
