import type { Task } from "@/features/tasks/tasksApiSlice";
import type { Sprint } from "@/features/sprints/sprintsApiSlice";
import type { FilterState } from "@/pages/projects/components/SearchAndFilter";

/**
 * Universal task filtering function
 */
export function filterTasks(
  tasks: Task[],
  filters: FilterState,
  sprints?: Sprint[],
  sprintMap?: Map<string, Sprint>,
): Task[] {
  return tasks.filter((task) => {
    // Search
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!task.title?.toLowerCase().includes(q)) return false;
    }

    // Status — normalize both sides to UPPER
    if (
      filters.status !== "ALL" &&
      task.status?.toUpperCase() !== filters.status.toUpperCase()
    )
      return false;

    // Priority — normalize both sides to UPPER
    if (
      filters.priority !== "ALL" &&
      task.priority?.toUpperCase() !== filters.priority.toUpperCase()
    )
      return false;

    // Type — normalize both sides to UPPER
    if (
      filters.type !== "ALL" &&
      task.type?.toUpperCase() !== filters.type.toUpperCase()
    )
      return false;

    // Sprint State
    if (filters.sprintState !== "ALL" && task.sprintId) {
      let sprint: Sprint | undefined;

      if (sprintMap) {
        sprint = sprintMap.get(task.sprintId);
      } else if (sprints) {
        sprint = sprints.find((s) => s.id === task.sprintId);
      }

      if (
        !sprint ||
        sprint.status?.toUpperCase() !== filters.sprintState.toUpperCase()
      )
        return false;
    }

    return true;
  });
}