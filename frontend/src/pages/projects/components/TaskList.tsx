import Backlog from "./Backlog";
import SearchAndFilter from "./SearchAndFilter";
import Epic from "./Epic";

import type { Epic as EpicType } from "@/features/epics/epicsApiSlice";
import type { Sprint } from "@/features/sprints/sprintsApiSlice";
import type { Task } from "@/features/tasks/tasksApiSlice";

interface TaskListProps {
  epics: EpicType[];
  sprints: Sprint[];
  tasks: Task[];
  backlogTasks: Task[];
}

const TaskList = ({ epics, sprints, tasks, backlogTasks }: TaskListProps) => {
  return (
    <div>
      <SearchAndFilter />
      <Epic epics={epics} sprints={sprints} tasks={tasks} />
      <Backlog tasks={backlogTasks} />
    </div>
  );
};

export default TaskList;
