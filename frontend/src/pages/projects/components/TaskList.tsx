// TaskList.tsx
import { useState, useMemo, useEffect } from "react";
import Backlog from "./Backlog";
import Epic from "./Epic";
import SearchAndFilter, { type FilterState } from "./SearchAndFilter";

import type { Epic as EpicType } from "@/features/epics/epicsApiSlice";
import type { Sprint } from "@/features/sprints/sprintsApiSlice";
import type { Task } from "@/features/tasks/tasksApiSlice";
import { filterTasks } from "@/utils/taskFilters";

interface TaskListProps {
  epics: EpicType[];
  sprints: Sprint[];
  tasks: Task[];
  backlogTasks: Task[];
}

const DEFAULT_FILTERS: FilterState = {
  search: "",
  status: "ALL",
  priority: "ALL",
  type: "ALL",
  sprintState: "ALL",
};



const TaskList = ({ epics, sprints, tasks, backlogTasks }: TaskListProps) => {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const isFiltering =
    filters.search !== "" ||
    filters.status !== "ALL" ||
    filters.priority !== "ALL" ||
    filters.type !== "ALL" ||
    filters.sprintState !== "ALL";

  const sprintMap = useMemo(
    () => new Map(sprints.map((s) => [s.id, s])),
    [sprints],
  );

const filteredTasks = useMemo(
  () => filterTasks(tasks, filters, undefined, sprintMap),
  [tasks, filters, sprintMap],
);

const filteredBacklog = useMemo(
  () => filterTasks(backlogTasks, filters, undefined, sprintMap),
  [backlogTasks, filters, sprintMap],
);

  // 2. Build sets of sprint/epic IDs that still have matching tasks
  const activeSprintIds = useMemo(
    () => new Set(filteredTasks.map((t) => t.sprintId).filter(Boolean)),
    [filteredTasks],
  );

  const activeEpicIds = useMemo(
    () => new Set(filteredTasks.map((t) => t.epicId).filter(Boolean)),
    [filteredTasks],
  );

  // 3. Filter sprints — only those with matching tasks (or all if no filter active)
  const filteredSprints = useMemo(() => {
    if (!isFiltering) return sprints;
    return sprints.filter((s) => activeSprintIds.has(s.id));
  }, [sprints, activeSprintIds, isFiltering]);

  // 4. Filter epics — only those with matching tasks (or all if no filter active)
  const filteredEpics = useMemo(() => {
    if (!isFiltering) return epics;
    return epics.filter((e) => activeEpicIds.has(e.id));
  }, [epics, activeEpicIds, isFiltering]);

  useEffect(() => {
    console.log("FILTERS:", filters);
    console.log("FILTERED TASKS:", filteredTasks);
  }, [filters, filteredTasks]);
  // TaskList.tsx
  return (
    <div>
      <SearchAndFilter filters={filters} onChange={setFilters} />

      <Epic
        epics={filteredEpics}
        sprints={filteredSprints}
        tasks={filteredTasks}
        isFiltering={isFiltering}
      />
      <Backlog
        key={
          "backlog-" +
          filters.search +
          filters.status +
          filters.priority +
          filters.type +
          filters.sprintState
        }
        tasks={filteredBacklog}
      />
    </div>
  );
};

export default TaskList;
