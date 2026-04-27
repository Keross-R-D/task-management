import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Button,
} from "ikon-react-components-lib";
import { Calendar } from "lucide-react";
import TaskList from "./components/TaskList";
import { Upload, Plus, List, LayoutGrid, Users } from "lucide-react";
import SearchAndFilter, {
  type FilterState,
} from "./components/SearchAndFilter";
import TaskBoard from "./components/TaskBoard";
import ResourceUtilization from "./components/ResouceUtilisation";
import { SimpleWidget } from "ikon-react-components-lib";
import { useState, useMemo } from "react";
import AddEpicModal from "./components/AddEpicModal";
import { useGetEpicsByProjectQuery } from "@/features/epics/epicsApiSlice";
import { useGetSprintsByProjectQuery } from "@/features/sprints/sprintsApiSlice";
import {
  useGetTasksByProjectQuery,
  useGetTasksBacklogQuery,
} from "@/features/tasks/tasksApiSlice";
import { useParams } from "react-router-dom";
import { filterTasks } from "@/utils/taskFilters";

const DEFAULT_FILTERS: FilterState = {
  search: "",
  status: "ALL",
  priority: "ALL",
  type: "ALL",
  sprintState: "ALL",
};

export default function ProjectDetailPage() {
  const { projectId = "" } = useParams();

  // ── RTK Query hooks ──
  const { data: epics = [], isLoading: epicsLoading } =
    useGetEpicsByProjectQuery(projectId, { skip: !projectId });
  const { data: sprints = [], isLoading: sprintsLoading } =
    useGetSprintsByProjectQuery(projectId, { skip: !projectId });
  const { data: allTasks = [], isLoading: tasksLoading } =
    useGetTasksByProjectQuery(projectId, { skip: !projectId });
  const { data: backlogTasks = [], isLoading: backlogLoading } =
    useGetTasksBacklogQuery(projectId, { skip: !projectId });

  // ── Epic modal state ──
  const [open, setOpen] = useState(false);

  // ── Filter state — one per tab so they don't interfere ──
  const [boardFilters, setBoardFilters] =
    useState<FilterState>(DEFAULT_FILTERS);

  const isLoading =
    epicsLoading || sprintsLoading || tasksLoading || backlogLoading;

  // ── Computed metrics (unfiltered — always show real numbers) ──
  const metrics = useMemo(() => {
    const totalTasks = allTasks.length;
    const doneTasks = allTasks.filter(
      (t) => t.status?.toLowerCase() === "done",
    ).length;
    const estimatedHours = allTasks.reduce(
      (sum, t) => sum + (t.estimatedHours || 0),
      0,
    );
    const actualHours = allTasks.reduce(
      (sum, t) => sum + (t.actualHours || 0),
      0,
    );
    const completion =
      totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
    return { totalTasks, doneTasks, estimatedHours, actualHours, completion };
  }, [allTasks]);

  const boardFilteredTasks = useMemo(() => {
    return filterTasks(allTasks, boardFilters, sprints);
  }, [allTasks, boardFilters, sprints]);

  return (
    <div className="w-full">
      {/* ================= TOP PROJECT CARD ================= */}
      <div className="border rounded-4xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:px-6 md:py-2">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg md:text-xl font-semibold">
                Project Details
              </h2>
              <span className="text-xs px-3 py-1 rounded-full border">
                {isLoading ? "Loading..." : `${epics.length} Epics`}
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-1">
              {metrics.totalTasks} tasks across {sprints.length} sprints
            </p>
          </div>

          <div className="flex items-center gap-2 border px-4 py-2 rounded-xl text-sm w-fit">
            <Calendar className="text-lg" />
            <span>Project Timeline</span>
          </div>
        </div>

        <div className="border-t"></div>

        {/* Stats — always unfiltered */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
          <SimpleWidget
            title="Completion"
            primaryText={`${metrics.completion}%`}
            secondaryText=""
            iconName=""
            mainClassName="p-0 border-none shadow-none bg-transparent"
          />
          <SimpleWidget
            title="Tasks (Total / Done)"
            primaryText={`${metrics.totalTasks} / ${metrics.doneTasks}`}
            secondaryText=""
            iconName=""
            mainClassName="p-0 border-none shadow-none bg-transparent"
          />
          <SimpleWidget
            title="Estimated Hours"
            primaryText={`${metrics.estimatedHours}h`}
            secondaryText=""
            iconName=""
            mainClassName="p-0 border-none shadow-none bg-transparent"
          />
          <SimpleWidget
            title="Actual Hours"
            primaryText={`${metrics.actualHours}h`}
            secondaryText=""
            iconName=""
            mainClassName="p-0 border-none shadow-none bg-transparent"
          />
        </div>
      </div>

      {/* ================= TABS SECTION ================= */}
      <div className="mt-6 flex flex-col gap-4">
        <Tabs defaultValue="task" className="w-full">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <TabsList className="border rounded-xl p-1 flex gap-1 w-fit">
              <TabsTrigger value="task">
                <List size={16} /> Task List
              </TabsTrigger>
              <TabsTrigger value="board">
                <LayoutGrid size={16} /> Board
              </TabsTrigger>
              <TabsTrigger value="resource">
                <Users size={16} /> Resource Utilisation
              </TabsTrigger>
            </TabsList>

            <div className="flex md:justify-end gap-3">
              <Button variant="outline">
                <Upload size={16} className="mr-2" />
                Bulk Upload
              </Button>
              <Button onClick={() => setOpen(true)}>
                <Plus size={16} className="mr-2" />
                Add Epic
              </Button>
            </div>
          </div>

          {/* TASK TAB — TaskList owns its own filter state internally */}
          <TabsContent value="task">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading project data...
              </div>
            ) : (
              <TaskList
                epics={epics}
                sprints={sprints}
                tasks={allTasks}
                backlogTasks={backlogTasks}
              />
            )}
          </TabsContent>

          {/* BOARD TAB — filter state owned here in ProjectDetailPage */}
          <TabsContent value="board">
            <SearchAndFilter
              filters={boardFilters}
              onChange={setBoardFilters}
            />
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading tasks...
              </div>
            ) : (
              <TaskBoard tasks={boardFilteredTasks} />
            )}
          </TabsContent>

          {/* RESOURCE TAB */}
          <TabsContent value="resource">
            <ResourceUtilization />
          </TabsContent>
        </Tabs>
      </div>

      <AddEpicModal
        open={open}
        projectId={projectId}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}
