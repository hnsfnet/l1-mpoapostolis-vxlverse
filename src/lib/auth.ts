import { pb } from "./pocketbase";
import type { RecordAuthResponse, RecordModel } from "pocketbase";

/**
 * Supported OAuth2 providers. Add a new entry here (and a thin wrapper in
 * `useAuth`) to enable an additional social login flow.
 */
export type OAuthProvider = "google";

export interface RegisterFields {
  email: string;
  password: string;
  passwordConfirm: string;
}

export type AuthAction = "login" | "register" | "oauth";

/** Authenticate through an external OAuth2 provider (e.g. Google). */
export function signInWithOAuth(
  provider: OAuthProvider
): Promise<RecordAuthResponse<RecordModel>> {
  return pb.collection("users").authWithOAuth2({ provider });
}

/** Authenticate with an email and password. */
export function signInWithPassword(
  email: string,
  password: string
): Promise<RecordAuthResponse<RecordModel>> {
  return pb.collection("users").authWithPassword(email, password);
}

/** Create a new account and immediately authenticate it. */
export async function registerWithPassword(
  fields: RegisterFields
): Promise<RecordAuthResponse<RecordModel>> {
  await pb.collection("users").create({
    email: fields.email,
    password: fields.password,
    passwordConfirm: fields.passwordConfirm,
  });

  return signInWithPassword(fields.email, fields.password);
}

/** Clear the active session in PocketBase. */
export function signOut(): void {
  pb.authStore.clear();
}

/**
 * Convert a PocketBase error into a user-facing message so that every auth
 * flow reports failures the same way.
 */
export function getAuthErrorMessage(err: unknown, action: AuthAction): string {
  const pbError = err as {
    data?: { data?: Record<string, { message?: string }> };
    message?: string;
  };

  // Field-level validation errors (most common during registration).
  const fieldErrors = pbError?.data?.data;
  if (fieldErrors && Object.keys(fieldErrors).length > 0) {
    return Object.entries(fieldErrors)
      .map(([field, info]) => `${field}: ${info?.message ?? "is invalid"}`)
      .join(", ");
  }

  switch (action) {
    case "login":
      return "Invalid email or password";
    case "register":
      return pbError?.message || "Registration failed. Please try again.";
    case "oauth":
      return pbError?.message || "Failed to sign in. Please try again.";
  }
}
