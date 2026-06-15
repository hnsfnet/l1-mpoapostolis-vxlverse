import { create } from "zustand";
import { pb } from "../lib/pocketbase";
import type { RecordModel } from "pocketbase";

type AuthRecord = RecordModel | null;

interface AuthState {
  user: AuthRecord;
  isAuthenticated: boolean;
  loading: boolean;
  authError: string | null;

  // Actions
  clearError: () => void;
  signInWithPassword: (email: string, password: string) => Promise<AuthRecord>;
  signInWithOAuth: (provider: string) => Promise<AuthRecord>;
  register: (
    email: string,
    password: string,
    passwordConfirm: string
  ) => Promise<AuthRecord>;
  logout: () => void;
}

function extractErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object") {
    const e = err as any;
    if (e.data?.data) {
      return Object.entries(e.data.data)
        .map(([field, messages]) => `${field}: ${messages}`)
        .join(", ");
    }
    if (typeof e.message === "string" && e.message) {
      return e.message;
    }
  }
  return fallback;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: pb.authStore.model as AuthRecord,
  isAuthenticated: pb.authStore.isValid,
  loading: false,
  authError: null,

  clearError: () => set({ authError: null }),

  signInWithPassword: async (email, password) => {
    set({ loading: true, authError: null });
    try {
      const authData = await pb.collection("users").authWithPassword(email, password);
      const user = authData.record as AuthRecord;
      set({ user, isAuthenticated: true, loading: false });
      return user;
    } catch (err) {
      const message = extractErrorMessage(err, "Invalid email or password");
      set({ loading: false, authError: message });
      return null;
    }
  },

  signInWithOAuth: async (provider) => {
    set({ loading: true, authError: null });
    try {
      const authData = await pb
        .collection("users")
        .authWithOAuth2({ provider });
      const user = authData.record as AuthRecord;
      set({ user, isAuthenticated: true, loading: false });
      return user;
    } catch (err) {
      const message = extractErrorMessage(
        err,
        `Failed to sign in with ${provider}. Please try again.`
      );
      set({ loading: false, authError: message });
      return null;
    }
  },

  register: async (email, password, passwordConfirm) => {
    if (password !== passwordConfirm) {
      set({ authError: "Passwords don't match" });
      return null;
    }
    set({ loading: true, authError: null });
    try {
      await pb.collection("users").create({ email, password, passwordConfirm });
      const authData = await pb.collection("users").authWithPassword(email, password);
      const user = authData.record as AuthRecord;
      set({ user, isAuthenticated: true, loading: false });
      return user;
    } catch (err) {
      const message = extractErrorMessage(err, "Registration failed. Please try again.");
      set({ loading: false, authError: message });
      return null;
    }
  },

  logout: () => {
    pb.authStore.clear();
    set({ user: null, isAuthenticated: false, authError: null });
  },
}));

// Keep store in sync when PocketBase auth state changes externally
// (e.g. token expiry, cross-tab sign-out)
pb.authStore.onChange((_token, model) => {
  useAuthStore.setState({
    user: (model as AuthRecord) ?? null,
    isAuthenticated: pb.authStore.isValid,
  });
});
