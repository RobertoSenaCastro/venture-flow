import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

import {
  UNAUTHORIZED_EVENT,
  clearStoredToken,
  getStoredToken,
  storeToken,
} from "../../shared/api/httpClient";
import { fetchCurrentUser, login as requestLogin } from "./api/authApi";
import type { AuthUser, LoginCredentials } from "./types/auth";

interface AuthContextValue {
  user: AuthUser | null;
  /** True while the stored token is being validated on startup. */
  isInitializing: boolean;
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Holds the signed-in user for the whole application.
 *
 * On startup a stored token is verified against the backend instead of trusted.
 * A token can expire, be revoked by deactivating the user, or be edited by
 * hand, so the only reliable check is asking the server.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    if (!getStoredToken()) {
      setIsInitializing(false);
      return;
    }

    let isActive = true;

    fetchCurrentUser()
      .then((response) => {
        if (isActive) {
          setUser(toAuthUser(response));
        }
      })
      .catch(() => {
        clearStoredToken();

        if (isActive) {
          setUser(null);
        }
      })
      .finally(() => {
        if (isActive) {
          setIsInitializing(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  // Any request that comes back 401 signs the user out, wherever it came from.
  useEffect(() => {
    function handleUnauthorized() {
      setUser(null);
    }

    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);

    return () => {
      window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    };
  }, []);

  const signIn = useCallback(async (credentials: LoginCredentials) => {
    const response = await requestLogin(credentials);

    if (!response.token) {
      throw new Error("O servidor não devolveu um token.");
    }

    storeToken(response.token);
    setUser(toAuthUser(response));
  }, []);

  const signOut = useCallback(() => {
    clearStoredToken();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isInitializing, signIn, signOut }),
    [user, isInitializing, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider.");
  }

  return context;
}

function toAuthUser(response: AuthUser): AuthUser {
  return {
    userId: response.userId,
    name: response.name,
    email: response.email,
    role: response.role,
    resellerId: response.resellerId,
  };
}
