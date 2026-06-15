import { create } from "zustand";
import { pb } from "../lib/pocketbase";
import { signOut } from "../lib/auth";

interface AuthState {
  /**
   * The authenticated PocketBase user record. Kept loosely typed because the
   * record shape is defined by the backend collection and varies per app.
   */
  user: any;
  token: string;
  isAuthenticated: boolean;
  /** Replace the current user (e.g. right after a successful sign-in). */
  setUser: (user: any | null) => void;
  /** Pull the latest auth state from PocketBase into the store. */
  sync: () => void;
  /** Clear the session everywhere (PocketBase + store). */
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: pb.authStore.model,
  token: pb.authStore.token,
  isAuthenticated: pb.authStore.isValid,
  setUser: (user) => set({ user, token: pb.authStore.token, isAuthenticated: !!user }),
  sync: () =>
    set({
      user: pb.authStore.model,
      token: pb.authStore.token,
      isAuthenticated: pb.authStore.isValid,
    }),
  logout: () => {
    signOut();
    set({ user: null, token: "", isAuthenticated: false });
  },
}));

// Keep the store in sync with PocketBase for changes that originate outside the
// UI flow: OAuth popups, automatic token refreshes, logout, and other tabs.
pb.authStore.onChange(() => {
  useAuthStore.getState().sync();
});
