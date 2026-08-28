export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data?: T;
}

/**
 * Thin wrapper around `fetch` for the JSON API. Unwraps the `{ success, data }`
 * envelope and turns non-2xx responses into a typed {@link ApiError}.
 */
export async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers },
    });
  } catch {
    throw new ApiError("Can't reach the server. Is the API running?", 0);
  }

  if (response.status === 204) return undefined as T;

  const body = (await response.json().catch(() => ({}))) as ApiEnvelope<T>;
  if (!response.ok) {
    throw new ApiError(body.message ?? "Something went wrong. Please try again.", response.status);
  }
  return body.data as T;
}
