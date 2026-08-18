import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";

import { useAuth } from "../AuthContext";
import type { UserRole } from "../types/auth";

interface ProtectedRouteProps {
  children: ReactNode;
  /** When present, only these roles may render the children. */
  allowedRoles?: UserRole[];
}

/**
 * Gate for routes that require a signed-in user.
 *
 * This hides interface, it does not protect data. Every endpoint behind these
 * pages enforces the same rules server side, which is what actually stops a
 * request that skips the interface entirely.
 */
export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return <p className="auth-loading">Carregando…</p>;
  }

  if (!user) {
    // Remember where the user was headed so login can send them back.
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
