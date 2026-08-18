import {
  apiFetch,
  buildApiUrl,
} from "../../../shared/api/httpClient";
import type { LoginCredentials, LoginResponse } from "../types/auth";

/**
 * Exchanges credentials for a token.
 *
 * Uses plain fetch rather than apiFetch on purpose: a 401 here means the
 * password was wrong, not that a stored session expired, so it must not
 * trigger the global sign-out event.
 */
export async function login(
  credentials: LoginCredentials,
): Promise<LoginResponse> {
  const response = await fetch(buildApiUrl("/api/auth/login"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (response.status === 401) {
    throw new Error("E-mail ou senha incorretos.");
  }

  if (!response.ok) {
    throw new Error(`Não foi possível entrar. HTTP ${response.status}`);
  }

  return (await response.json()) as LoginResponse;
}

/**
 * Confirms that a stored token is still usable, typically after a page reload.
 */
export async function fetchCurrentUser(): Promise<LoginResponse> {
  const response = await apiFetch("/api/auth/me");

  if (!response.ok) {
    throw new Error(`Sessão inválida. HTTP ${response.status}`);
  }

  return (await response.json()) as LoginResponse;
}
