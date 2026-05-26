import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Button,
  CardContent,
} from "ikon-react-components-lib";
import { Calendar } from "lucide-react";
import TaskList from "./components/TaskList";
import { Upload, Plus, List, LayoutGrid, Users } from "lucide-react";
import SearchAndFilter, {
  type FilterState,
} from "./components/SearchAndFilter";
import TaskBoard from "./components/TaskBoard";
import ResourceUtilization from "./components/ResouceUtilisation";
import { useState, useMemo, useEffect } from "react";
import AddEpicModal from "./components/AddEpicModal";
import { useDispatch } from "react-redux";
import { setBreadcrumbLabel } from "@/features/ui/uiSlice";
import { useGetEpicsByProjectQuery } from "@/features/epics/epicsApiSlice";
import { useGetSprintsByProjectQuery } from "@/features/sprints/sprintsApiSlice";
import {
  useGetTasksByProjectQuery,
  useGetTasksBacklogQuery,
} from "@/features/tasks/tasksApiSlice";
import { useGetProjectsQuery } from "@/features/projects/projectsApiSlice";
import moment from "moment";
import { useParams } from "react-router-dom";
import { filterTasks } from "@/utils/taskFilters";

const DEFAULT_FILTERS: FilterState = {
  search: "",
  status: "ALL",
  priority: "ALL",
  type: "ALL",
  sprintState: "ALL",
};
import AddTaskBulkUploadModal from "./components/AddTaskBulkUploadModal";

export default function ProjectDetailPage() {
  const [bulkOpen, setBulkOpen] = useState(false);
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
  const { data: projects = [] } = useGetProjectsQuery();
  const project = projects.find((p) => String(p.id) === projectId);

  // ── Epic modal state ──
  const [open, setOpen] = useState(false);

  // ── Filter state — one per tab so they don't interfere ──
  const [boardFilters, setBoardFilters] =
    useState<FilterState>(DEFAULT_FILTERS);

  const dispatch = useDispatch();
  useEffect(() => {
    if (project?.projectName) {
      dispatch(setBreadcrumbLabel({ id: projectId, label: project.projectName }));
    }
  }, [project, projectId, dispatch]);

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
      <div className="rounded-2xl border dark:border-2 overflow-hidden">
        {/* Header */}
        <div className="flex flex-col items-start gap-4 px-4 py-2 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold tracking-tight">
                {project?.projectName}
              </h2>

              <span className="rounded-full px-2 py-0.5 text-xs bg-slate-500/20 border-slate-500/20 font-medium border">
                {isLoading ? "Loading..." : `${epics.length} Epics`}
              </span>
            </div>

            <p className="mt-2 text-sm text-muted-foreground font-semibold">
              {metrics.totalTasks} tasks across {sprints.length} sprints
            </p>
          </div>

          <div className="flex w-fit items-center gap-3 rounded-2xl px-5 py-3 text-sm font-medium  border">
            <Calendar className="h-4 w-4" />

            <span>
              {project?.startDate
                ? moment(project.startDate).format("MMM D, YYYY")
                : "—"}{" "}
              -{" "}
              {project?.endDate
                ? moment(project.endDate).format("MMM D, YYYY")
                : "—"}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t" />

        {/* Stats */}
        <div className="grid grid-cols-2 gap-8 p-4 pb-3 md:grid-cols-4">
          <CardContent className="flex flex-col gap-3 p-0">
            <p className="text-sm">Completion</p>

            <h2 className="text-2xl font-semibold leading-none text-green-500">
              {metrics.completion}%
            </h2>
          </CardContent>

          <CardContent className="flex flex-col gap-1 p-0">
            <p className="text-sm">Tasks (Total / Done)</p>

            <h2 className="text-2xl font-semibold leading-none ">
              <span className="text-3xl">{metrics.totalTasks} </span>
              <span className="text-muted-foreground">/ {metrics.doneTasks}</span>
            </h2>
          </CardContent>

          <CardContent className="flex flex-col gap-3 p-0">
            <p className="text-sm">Estimated Hours</p>

            <h2 className="text-2xl font-semibold leading-none ">
              {metrics.estimatedHours}h
            </h2>
          </CardContent>

          <CardContent className="flex flex-col gap-3 p-0">
            <p className="text-sm ">Actual Hours</p>

            <h2 className="text-2xl font-semibold leading-none text-indigo-500">
              {metrics.actualHours}h
            </h2>
          </CardContent>
        </div>
      </div>

      {/* ================= TABS SECTION ================= */}
      <div className="mt-6 flex flex-col gap-4">
        <Tabs defaultValue="task" className="w-full">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <TabsList className="border rounded-xl p-1 flex gap-1 w-fit py-4.5!">
              <TabsTrigger
                value="task"
                className="bg-transparent rounded-lg dark:data-[state=active]:bg-[#0a0a0a] dark:data-[state=active]:text-white px-3 py-3.5!"
              >
                <List size={16} /> Task List
              </TabsTrigger>

              <TabsTrigger
                value="board"
                className="bg-transparent rounded-lg dark:data-[state=active]:bg-[#0a0a0a] dark:data-[state=active]:text-white px-3 py-3.5!"
              >
                <LayoutGrid size={16} /> Board
              </TabsTrigger>

              <TabsTrigger
                value="resource"
                className="bg-transparent rounded-lg dark:data-[state=active]:bg-[#0a0a0a] dark:data-[state=active]:text-white px-3 py-3.5!"
              >
                <Users size={16} /> Resource Utilisation
              </TabsTrigger>
            </TabsList>

            <div className="flex md:justify-end gap-3">
              <Button variant="outline" onClick={() => setBulkOpen(true)}>
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
            <ResourceUtilization tasks={allTasks} epics={epics} />
          </TabsContent>
        </Tabs>
      </div>

      <AddEpicModal
        open={open}
        projectId={projectId}
        onClose={() => setOpen(false)}
        projectStartDate={project?.startDate}
        projectEndDate={project?.endDate}
      />
      <AddTaskBulkUploadModal
        open={bulkOpen}
        projectId={projectId}
        onClose={() => setBulkOpen(false)}
      />
    </div>
  );
}
