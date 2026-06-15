import { useCallback, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getAuthErrorMessage,
  registerWithPassword,
  signInWithOAuth,
  signInWithPassword,
  type AuthAction,
  type OAuthProvider,
  type RegisterFields,
} from "../lib/auth";
import { useAuthStore } from "../stores/authStore";

interface AuthActionOptions {
  /** Called after a successful auth action (e.g. to close a modal). */
  onSuccess?: () => void;
  /** Redirect to the originally requested page after success. Defaults to true. */
  redirect?: boolean;
}

/**
 * Centralizes every authentication flow. UI components stay presentational and
 * delegate the request, store update, redirect, and error handling to here.
 */
export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setUser = useAuthStore((state) => state.setUser);
  const storeLogout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const location = useLocation();

  // The page the user originally tried to reach before being sent to login.
  const from =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || "/";

  const clearError = useCallback(() => setError(null), []);

  const run = useCallback(
    async (
      authCall: () => Promise<{ record: any } | undefined>,
      action: AuthAction,
      options?: AuthActionOptions
    ) => {
      setError(null);
      setLoading(true);
      try {
        const authData = await authCall();
        if (authData) {
          setUser(authData.record);
          if (options?.redirect !== false) {
            navigate(from, { replace: true });
          }
          options?.onSuccess?.();
        }
        return authData;
      } catch (err) {
        console.error(`${action} auth error:`, err);
        setError(getAuthErrorMessage(err, action));
        return undefined;
      } finally {
        setLoading(false);
      }
    },
    [from, navigate, setUser]
  );

  const loginWithOAuth = useCallback(
    (provider: OAuthProvider, options?: AuthActionOptions) =>
      run(() => signInWithOAuth(provider), "oauth", options),
    [run]
  );

  const loginWithGoogle = useCallback(
    (options?: AuthActionOptions) => loginWithOAuth("google", options),
    [loginWithOAuth]
  );

  const loginWithPassword = useCallback(
    (email: string, password: string, options?: AuthActionOptions) =>
      run(() => signInWithPassword(email, password), "login", options),
    [run]
  );

  const register = useCallback(
    (fields: RegisterFields, options?: AuthActionOptions) =>
      run(() => registerWithPassword(fields), "register", options),
    [run]
  );

  const logout = useCallback(
    (options?: { redirect?: boolean; onSuccess?: () => void }) => {
      storeLogout();
      if (options?.redirect) {
        navigate("/", { replace: true });
      }
      options?.onSuccess?.();
    },
    [navigate, storeLogout]
  );

  return {
    loading,
    error,
    setError,
    clearError,
    loginWithGoogle,
    loginWithOAuth,
    loginWithPassword,
    register,
    logout,
  };
}
