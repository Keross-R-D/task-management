export const TaskEnum = {
  Status: {
    TODO: "TODO",
    IN_PROGRESS: "IN_PROGRESS",
    DONE: "DONE",
    BLOCKED: "BLOCKED",
  },

  Priority: {
    LOW: "LOW",
    MEDIUM: "MEDIUM",
    HIGH: "HIGH",
    CRITICAL: "CRITICAL",
  },

  Type: {
    TASK: "TASK",
    BUG: "BUG",
    STORY: "STORY",
  },
} as const;

// ================= TYPES =================
export type TaskStatus =
  typeof TaskEnum.Status[keyof typeof TaskEnum.Status];

export type TaskPriority =
  typeof TaskEnum.Priority[keyof typeof TaskEnum.Priority];

