export const ProjectEnum = {
  Status: {
    NOT_STARTED: "NOT_STARTED",
    IN_PROGRESS: "IN_PROGRESS",
    COMPLETED: "COMPLETED",
  },

  Type: {
    INTERNAL: "INTERNAL",
    EXTERNAL: "EXTERNAL",
  },
} as const;

// ================= TYPES =================
export type ProjectStatus =
  typeof ProjectEnum.Status[keyof typeof ProjectEnum.Status];

export type ProjectType =
  typeof ProjectEnum.Type[keyof typeof ProjectEnum.Type];

