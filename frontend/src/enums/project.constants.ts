export const ProjectEnum = {
  Status: {
    PLANNED: "PLANNED",
    IN_PROGRESS: "IN_PROGRESS",
    COMPLETED: "COMPLETED",
    ON_HOLD: "ON_HOLD",
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