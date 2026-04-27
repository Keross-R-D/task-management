export const SprintEnum = {
  Status: {
    PLANNED: "PLANNED",
    ACTIVE: "ACTIVE",
    COMPLETED: "COMPLETED",
    CANCELLED: "CANCELLED",
  },
} as const;

// TYPES
export type SprintStatus =
  typeof SprintEnum.Status[keyof typeof SprintEnum.Status];
