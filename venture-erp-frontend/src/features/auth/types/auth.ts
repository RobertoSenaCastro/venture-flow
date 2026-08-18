export type UserRole = "ADMIN" | "ASSEMBLY_SUPERVISOR";

/**
 * The signed-in user as the interface needs it.
 *
 * The role is here to decide what to render. It is never a security boundary:
 * the backend re-checks permission on every request, because anything held in
 * the browser can be edited by whoever is holding it.
 */
export interface AuthUser {
  userId: number;
  name: string;
  email: string;
  role: UserRole;
  resellerId: number | null;
}

/** Shape returned by POST /api/auth/login and GET /api/auth/me. */
export interface LoginResponse extends AuthUser {
  token: string | null;
  expiresInSeconds: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
