import { useMemo } from "react";
import { useGetUsersQuery } from "@/features/users/usersApiSlice";

export interface UserInfo {
  id: string;
  name: string;
  email: string;
}

// Default capacity hours per month per user (easily configurable later)
export const DEFAULT_CAPACITY_HOURS = 160;

/**
 * Custom hook to get user information from the global RTK query slice.
 */
export function useUserMap() {
  const { data: users, isLoading, error } = useGetUsersQuery();

  // Map UUID to UserInfo
  const userMap = useMemo(() => {
    const map: Record<string, UserInfo> = {};
    if (users) {
      users.forEach((u) => {
        map[u.userId] = {
          id: u.userId,
          name: u.userName,
          email: u.userEmail,
        };
      });
    }
    return map;
  }, [users]);

  // List of all users
  const allUsers = useMemo(() => Object.values(userMap), [userMap]);

  // Helper to get info for a specific user ID
  const getUserInfo = (userId: string | null | undefined): UserInfo => {
    if (!userId) return { id: "unknown", name: "Unassigned", email: "" };
    return (
      userMap[userId] ?? {
        id: userId,
        name: `User (${userId.substring(0, 8)}…)`,
        email: "",
      }
    );
  };

  return {
    userMap,
    allUsers,
    getUserInfo,
    isLoading,
    error,
  };
}
