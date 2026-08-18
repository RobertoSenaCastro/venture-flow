/**
 * Single entry point for every call to the backend.
 *
 * Two things used to be repeated in each feature module and are now here: the
 * base URL, and the Authorization header. Centralising them means a token that
 * expires is handled the same way everywhere instead of once per module.
 */

const API_BASE_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

const TOKEN_STORAGE_KEY = "ventureflow.token";

/**
 * Fired when the backend rejects a stored token. AuthContext listens for it and
 * clears the session, which sends the user back to the login page.
 */
export const UNAUTHORIZED_EVENT = "ventureflow:unauthorized";

export function buildApiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function storeToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

/**
 * Performs an authenticated request.
 *
 * A 401 means the stored token is no longer accepted, so it is discarded here
 * rather than left to rot in storage and fail on every later call.
 */
export async function apiFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(options.headers);

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  const token = getStoredToken();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(buildApiUrl(path), { ...options, headers });

  if (response.status === 401) {
    clearStoredToken();
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
  }

  return response;
}

/**
 * Convenience wrapper for endpoints that return JSON.
 *
 * @throws Error when the response status is outside the 2xx range
 */
export async function apiFetchJson<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await apiFetch(path, options);

  if (!response.ok) {
    throw new Error(`Request to ${path} failed. HTTP ${response.status}`);
  }

  return (await response.json()) as T;
}
