/**
 * User mapping utility.
 *
 * This file centralizes the UUID → display name mapping used across
 * the app (resource utilization, task assignment, etc.).
 *
 * TODO: Replace with real user-management service API integration.
 * When the user-management service is available, fetch users from
 * its endpoints and populate this map dynamically.
 */

export interface UserInfo {
  id: string;
  name: string;
  email: string;
}

// Default capacity hours per month per user (easily configurable later)
export const DEFAULT_CAPACITY_HOURS = 160;

/**
 * Hardcoded user map — replace with API call later.
 * Key = UUID, Value = UserInfo
 */
export const USER_MAP: Record<string, UserInfo> = {
  "550e8400-e29b-41d4-a716-446655440000": {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "John Doe",
    email: "john@example.com",
  },
  "123e4567-e89b-12d3-a456-426614174000": {
    id: "123e4567-e89b-12d3-a456-426614174000",
    name: "Bob Johnson",
    email: "bob@example.com",
  },
  "987e6543-e21b-12d3-a456-426614174999": {
    id: "987e6543-e21b-12d3-a456-426614174999",
    name: "Alice Smith",
    email: "alice@example.com",
  },
};

/** Get user info by UUID, with fallback for unknown users */
export function getUserInfo(userId: string | null | undefined): UserInfo {
  if (!userId) return { id: "unknown", name: "Unassigned", email: "" };
  return (
    USER_MAP[userId] ?? {
      id: userId,
      name: `User (${userId.substring(0, 8)}…)`,
      email: "",
    }
  );
}

/** Get all known users as a list */
export function getAllUsers(): UserInfo[] {
  return Object.values(USER_MAP);
}
