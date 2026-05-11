export const EpicEnum = {
  Status: {
    PLANNED: "PLANNED",
    ACTIVE: "ACTIVE",
    COMPLETED: "COMPLETED",
    CANCELED: "CANCELED",
  },
} as const;

// TYPES
export type EpicStatus =
  typeof EpicEnum.Status[keyof typeof EpicEnum.Status];