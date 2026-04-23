export const EpicEnum = {
  Status: {
    NOT_STARTED: "NOT_STARTED",
    IN_PROGRESS: "IN_PROGRESS",
    COMPLETED: "COMPLETED",
  },
} as const;

// TYPES
export type EpicStatus =
  typeof EpicEnum.Status[keyof typeof EpicEnum.Status];
