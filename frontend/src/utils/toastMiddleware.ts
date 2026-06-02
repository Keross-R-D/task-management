// toastMiddleware.ts
import { isFulfilled, isRejectedWithValue } from "@reduxjs/toolkit";
import { toast } from "sonner";

const successMessages: Record<string, string> = {

  // PROJECTS

  createProject: "Project created successfully",

//   Epics
  createEpic: "Epic created successfully",
  updateEpic: "Epic updated successfully",
  deleteEpic: "Epic deleted successfully",

  // TASKS

  createTask: "Task created successfully",
  updateTask: "Task updated successfully",
  updateTaskStatus: "Task status updated successfully",
  deleteTask: "Task deleted successfully",

  // MY TASKS

  createMyTask: "My task created successfully",
  updateMyTask: "My task updated successfully",
  updateMyTaskStatus: "My task status updated successfully",
  deleteMyTask: "My task deleted successfully",

  // SPRINTS

  createSprint: "Sprint created successfully",
  updateSprint: "Sprint updated successfully",
  updateSprintStatus: "Sprint status updated successfully",
  deleteSprint: "Sprint deleted successfully",

  // WORKLOGS

  createWorklog: "Task workLog added successfully",
  updateWorklog: "Task workLog updated successfully",
  deleteWorklog: "Task workLog deleted successfully",

  // MY TASK WORKLOGS

  createMyTaskWorklog: "My task workLog added successfully",
  updateMyTaskWorklog: "My task workLog updated successfully",
  deleteMyTaskWorklog: "My task workLog deleted successfully",

  // BULK UPLOAD

  bulkUploadTasks: "Bulk upload done successfully",
};

const errorMessages: Record<string, string> = {
  createProject: "Failed to create project",

  createEpic: "Failed to create epic",
  updateEpic: "Failed to update epic",
  deleteEpic: "Failed to delete epic",

  createTask: "Failed to create task",
  updateTask: "Failed to update task",
  updateTaskStatus: "Failed to update task status",
  deleteTask: "Failed to delete task",

  createMyTask: "Failed to create my task",
  updateMyTask: "Failed to update my task",
  updateMyTaskStatus: "Failed to update my task status",
  deleteMyTask: "Failed to delete my task",

  createSprint: "Failed to create sprint",
  updateSprint: "Failed to update sprint",
  updateSprintStatus: "Failed to update sprint status",
  deleteSprint: "Failed to delete sprint",

  createWorklog: "Failed to add task workLog",
  updateWorklog: "Failed to update task workLog",
  deleteWorklog: "Failed to delete task workLog",

  createMyTaskWorklog: "Failed to add myTask workLog",
  updateMyTaskWorklog   : "Failed to update myTask workLog",
  deleteMyTaskWorklog: "Failed to delete myTask workLog",

  bulkUploadTasks: "Failed to upload tasks",
};

export const toastMiddleware =
  () => (next: any) => (action: any) => {
    const isMutation =
      action?.meta?.arg?.type === "mutation";

    const endpointName =
      action?.meta?.arg?.endpointName;

    // =========================
    // SUCCESS TOAST
    // =========================
    if (isMutation && isFulfilled(action)) {
      const message =
        successMessages[endpointName];

      if (message) {
        toast.success(message);
      }
    }

    // =========================
    // ERROR TOAST
    // =========================
    if (isMutation && isRejectedWithValue(action)) {
      const backendMessage =
        action.payload?.data?.message;

      const message =
        backendMessage ||
        errorMessages[endpointName] ||
        "Something went wrong";

      toast.error(message);
    }

    return next(action);
  };