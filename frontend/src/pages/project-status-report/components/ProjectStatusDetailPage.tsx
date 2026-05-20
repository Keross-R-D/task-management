import { useGetProjectsQuery } from "@/features/projects/projectsApiSlice";
import { useGetSprintsByProjectQuery } from "@/features/sprints/sprintsApiSlice";
import {
  useGetTasksByProjectQuery,
  type Task,
} from "@/features/tasks/tasksApiSlice";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DataTableLayout,
  Progress,
} from "ikon-react-components-lib";
import {
  ChevronLeft,
  FolderKanban,
  Info,
  TriangleAlert,
  Calendar,
  ChartColumn,
  Clock,
  Target,
  CircleCheck,
  CircleAlert,
  Download,
} from "lucide-react";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import WeekSprintTable from "./WeekSprintTable";
import DatePickerWithRange from "./DateRangePicker";
import { PDFDownloadLink } from "@react-pdf/renderer";
import ProjectStatusPdf from "./ProjectStatusPdf";
import { type DateRange } from "react-day-picker";
//Types
type OverdueTask = {
  sprintName: string;
  plannedStartDate: string;
  plannedEndDate: string;
  overdueDays: number;
  progress: number;
};

const ProjectStatusDetailPage: React.FC = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { data: projects = [], isLoading: isProjectLoading } = useGetProjectsQuery();
  const project = projects.find((p) => String(p.id) === id);
  const {
    data: sprints = [],
    isLoading: isSprintLoading,
  } = useGetSprintsByProjectQuery(id);
  console.log("SPRINTS:", sprints);

  const { data: tasks = [], isLoading: isTaskLoading } = useGetTasksByProjectQuery(id, { skip: !id });

  const today = new Date();

  // Week range helpers
  const getWeekRange = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const start = new Date(d.setDate(diff));
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  };

  const currentWeek = getWeekRange(today);
  const previousWeekDate = new Date(today);
  previousWeekDate.setDate(today.getDate() - 7);
  const nextWeekDate = new Date(today);
  nextWeekDate.setDate(today.getDate() + 7);

  // Date range state — initialized to current week by default
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: currentWeek.start,
    to: currentWeek.end,
  });

  // Handle date selection with max 7 days restriction
 const handleDateRangeChange = (range: DateRange | undefined) => {
  if (!range?.from) {
    setDateRange(range);
    return;
  }

  // only start selected
  if (range.from && !range.to) {
    setDateRange(range);
    return;
  }

  if (range.from && range.to) {
    const from = new Date(range.from);
    const to = new Date(range.to);

    from.setHours(0, 0, 0, 0);
    to.setHours(0, 0, 0, 0);

    const diffInDays = Math.floor(
      (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24),
    );

    // max allowed range = 7 days
    if (diffInDays > 6) {
      // detect which side user changed
      if (
        dateRange?.from &&
        from.getTime() !== new Date(dateRange.from).setHours(0, 0, 0, 0)
      ) {
        // start date changed -> move end date
        const adjustedTo = new Date(from);
        adjustedTo.setDate(from.getDate() + 6);

        setDateRange({
          from,
          to: adjustedTo,
        });

        return;
      }

      // end date changed -> move start date
      const adjustedFrom = new Date(to);
      adjustedFrom.setDate(to.getDate() - 6);

      setDateRange({
        from: adjustedFrom,
        to,
      });

      return;
    }
  }

  setDateRange(range);
};
  // Calculate dynamic week ranges based on selected date range
  const selectedWeek =
    dateRange?.from && dateRange?.to
      ? { start: dateRange.from, end: dateRange.to }
      : { start: currentWeek.start, end: currentWeek.end };

  // Get the project data
  const computedData = React.useMemo(() => {
    const tasksTotal = tasks.length;

    const tasksDone = tasks.filter(
      (t) => t.status?.toUpperCase() === "DONE",
    ).length;

    const estimatedHours = tasks.reduce(
      (sum, t) => sum + (t.estimatedHours || 0),
      0,
    );

    const actualHours = tasks.reduce((sum, t) => sum + (t.actualHours || 0), 0);

    const progress =
      tasksTotal > 0 ? Math.round((tasksDone / tasksTotal) * 100) : 0;

    const remainingTasks = tasksTotal - tasksDone;

    return {
      projectName: project?.projectName || "",
      startDate: project?.startDate || "",
      endDate: project?.endDate || "",
      status: project?.projectStatus || "",
      type: project?.type || "",
      clientName: project?.clientName || "",
      progress,
      estimatedHours,
      actualHours,
      tasksTotal,
      tasksDone,
      remainingTasks,
    };
  }, [project, tasks]);

  //Style for status
  const getStatusClass = (status: string) => {
    switch (status) {
      case "on_time":
        return "bg-green-500/10 text-green-500 border border-green-500/60";
      case "slight_delay":
        return "bg-yellow-500/10 text-yellow-500 border border-yellow-500/60";
      case "delay":
        return "bg-red-500/10 text-red-500 border border-red-500/60";
      default:
        return "bg-gray-500/10 text-gray-500 border border-gray-500/60";
    }
  };

  //Format date
  const formatDate = (date?: string | Date | null) => {
    if (!date) return "—";
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return "—";

    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  //Get tasks by sprint id
  const tasksBySprint = React.useMemo(() => {
    return tasks.reduce(
      (acc, task) => {
        if (!task.sprintId) return acc;

        if (!acc[task.sprintId]) acc[task.sprintId] = [];
        acc[task.sprintId].push(task);

        return acc;
      },
      {} as Record<string, Task[]>,
    );
  }, [tasks]);

  // Calculate progress for task
  const getProgress = (sprintId: string) => {
    const sprintTasks = tasksBySprint[sprintId] || [];
    const total = sprintTasks.length;
    const done = sprintTasks.filter((t) => t.status === "done").length;
    return total === 0 ? 0 : Math.round((done / total) * 100);
  };

  // Overdue tasks columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const overdueTasksColumns: any = [
    {
      accessorKey: "sprintName",
      header: () => <div className="font-semibold">Sprint Name</div>,
      cell: ({ row }: { row: { original: OverdueTask } }) => (
        <div className="text-left text-sm">{row.original.sprintName}</div>
      ),
    },
    {
      accessorKey: "plannedStartDate",
      header: () => <div className="font-semibold">Planned Start Date</div>,
      cell: ({ row }: { row: { original: OverdueTask } }) => (
        <div className="text-left">{row.original.plannedStartDate}</div>
      ),
    },
    {
      accessorKey: "plannedEndDate",
      header: () => <div className="font-semibold">Planned End Date</div>,
      cell: ({ row }: { row: { original: OverdueTask } }) => (
        <div className="text-left">{row.original.plannedEndDate}</div>
      ),
    },
    {
      accessorKey: "overdueDays",
      header: () => <div className="font-semibold">Overdue (in days)</div>,
      cell: ({ row }: { row: { original: OverdueTask } }) => {
        const days = row.original.overdueDays;
        const color =
          days > 0
            ? "bg-red-500/10 text-red-500"
            : "bg-green-500/10 text-green-500";
        return (
          <div className={`px-2 py-1 text-left w-fit rounded text-sm ${color}`}>
            {days} days
          </div>
        );
      },
    },
    {
      accessorKey: "progress",
      header: () => <div className="font-semibold">Progress</div>,
      cell: ({ row }: { row: { original: OverdueTask } }) => {
        const value = row.original.progress;

        return (
          <div className="flex items-center gap-2">
            <div className="w-24">
              <Progress value={value} className="[&>div]:bg-green-500"/>
            </div>
            <span className="text-sm">{value}%</span>
          </div>
        );
      },
    },
  ];

  // Table data for Overdue tasks - will be moved after filteredSprints
  const getProjectStatus = (endDate: string, overdueSprints: number) => {
    const today = new Date();
    const end = new Date(endDate);
    today.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    if (overdueSprints === 0) return "on_time";
    if (today > end) {
      const diffDays = Math.floor(
        (today.getTime() - end.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (diffDays <= 7) return "slight_delay";
      return "delay";
    }
    return "slight_delay";
  };
  // CURRENT WEEK
  // Sprint start date falls inside selected range

  const currentWeekStart = new Date(selectedWeek.start);
  currentWeekStart.setHours(0, 0, 0, 0);

  const currentWeekEnd = new Date(selectedWeek.end);
  currentWeekEnd.setHours(23, 59, 59, 999);

  const currentWeekSprints = sprints.filter((sprint) => {
    const sprintStart = new Date(sprint.startDate);
    const sprintEnd = new Date(sprint.endDate);
    sprintStart.setHours(0, 0, 0, 0);
    sprintEnd.setHours(23, 59, 59, 999);

    return sprintStart <= currentWeekEnd && sprintEnd >= currentWeekStart;
  });

  // PREVIOUS WEEK
  // Sprint ended within 7 days BEFORE selected range start

  const previousWeekStart = new Date(currentWeekStart);
  previousWeekStart.setDate(previousWeekStart.getDate() - 7);
  previousWeekStart.setHours(0, 0, 0, 0);

  const previousWeekSprints = sprints.filter((sprint) => {
    const sprintEnd = new Date(sprint.endDate);

    return sprintEnd >= previousWeekStart && sprintEnd < currentWeekStart;
  });

  // UPCOMING WEEK
  // Sprint starts within 7 days AFTER selected range end

  const upcomingWeekStart = new Date(currentWeekEnd);
  upcomingWeekStart.setDate(upcomingWeekStart.getDate() + 1);
  upcomingWeekStart.setHours(0, 0, 0, 0);

  const upcomingWeekEnd = new Date(currentWeekEnd);
  upcomingWeekEnd.setDate(upcomingWeekEnd.getDate() + 7);
  upcomingWeekEnd.setHours(23, 59, 59, 999);

  const upcomingWeekSprints = sprints.filter((sprint) => {
    const sprintStart = new Date(sprint.startDate);

    return sprintStart >= upcomingWeekStart && sprintStart <= upcomingWeekEnd;
  });

  const normalizedMinDate = React.useMemo(() => {
    if (!project?.startDate) return undefined;

    const d = new Date(project.startDate);
    d.setHours(0, 0, 0, 0);

    return d;
  }, [project]);

  const normalizedMaxDate = React.useMemo(() => {
    if (!project?.endDate) return undefined;

    const d = new Date(project.endDate);
    d.setHours(23, 59, 59, 999);

    return d;
  }, [project]);
  // Table data for Overdue tasks - computed after filteredSprints
  const overdueTasks = sprints
    .map((sprint) => {
      const endDate = new Date(sprint.endDate);
      const overdueDays =
        sprint.status !== "COMPLETED" && endDate < today
          ? Math.floor(
              (today.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24),
            )
          : 0;
      return {
        id: sprint.id,
        sprintName: sprint.name,
        plannedStartDate: sprint.startDate,
        plannedEndDate: sprint.endDate,
        overdueDays,
        progress: getProgress(sprint.id),
      };
    })
    .filter((s) => s.overdueDays > 0);

  const status = getProjectStatus(computedData.endDate, overdueTasks.length);
  //get current, previous and upcoming week sprints
  const currentWeekData = currentWeekSprints.map((s) => ({
    sprintName: s.name,
    progress: getProgress(s.id),
    plannedStartDate: s.startDate,
    plannedEndDate: s.endDate,
    status: s.status
  }));

  const upcomingWeekData = upcomingWeekSprints.map((s) => ({
    sprintName: s.name,
    progress: getProgress(s.id),
    plannedStartDate: s.startDate,
    plannedEndDate: s.endDate,
    status: s.status
  }));

  const isReportReady = !isProjectLoading && !isTaskLoading && !isSprintLoading && !!project;

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex justify-between mb-2">
        <button
          className="flex gap-2 text-sm font-bold cursor-pointer"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft />
          <div className="mt-0.5">Back to reports</div>
        </button>

        <div className="flex justify-end">
          <PDFDownloadLink
            document={
              <ProjectStatusPdf
                project={{
                  projectName: computedData.projectName,
                  startDate: formatDate(computedData.startDate),
                  endDate: formatDate(computedData.endDate),
                  projectStatus: computedData.status,
                  progress: computedData.progress,
                  estimatedHours: computedData.estimatedHours,
                  actualHours: computedData.actualHours,
                  type: computedData.type,
                  clientName: computedData.clientName,
                  overallStatus: status === "on_time" ? "ON_TIME" : status === "slight_delay" ? "SLIGHT_DELAY" : "DELAY",
                }}

                executiveSummary={{
                  runningOutOfTime: overdueTasks.length,
                  risks: 0,
                  completedTasks: computedData.tasksDone,
                  remainingTasks: computedData.remainingTasks,
                  totalTasks: computedData.tasksTotal,
                }}

                overdueTasks={overdueTasks}

                currentWeek={currentWeekData}

                previousWeek={previousWeekSprints.map((s) => ({
                  sprintName: s.name,
                  progress: getProgress(s.id),
                  plannedStartDate: s.startDate,
                  plannedEndDate: s.endDate,
                  status: s.status
                }))}

                upcomingWeek={upcomingWeekData}
              />
            }
            fileName={`PSR of ${computedData.projectName} - ${formatDate(today)}.pdf`}
          >
            <Button
              disabled={!isReportReady}
              className="px-4 py-2 rounded-lg text-sm"
            >
              <Download />
              {!isReportReady ? "Generating Report..." : "Download Report"}
            </Button>
          </PDFDownloadLink>
        </div>
      </div>

      <div>
        <div className="grid grid-cols-1 lg:grid-cols-2! gap-6">
          {/* Project Details */}
          <Card>
            <CardHeader className="flex justify-between items-center">
              <CardTitle className="text-2xl">Project Details</CardTitle>
              <span
                className={`px-3 py-1 text-xs rounded-full ${getStatusClass(status)}`}
              >
                {status === "on_time"
                  ? "On Time"
                  : status === "slight_delay"
                    ? "Slight Delay"
                    : "Delay"}
              </span>
            </CardHeader>

            <CardContent className="space-y-3 text-sm">
              <p className="flex items-center gap-2">
                <span className="flex items-center gap-1 font-bold">
                  <FolderKanban className="h-4" /> Project:
                </span>{" "}
                {computedData.projectName}
              </p>

              <p className="flex items-center gap-2">
                <span className="flex items-center gap-1 font-bold">
                  <Calendar className="h-4" /> Start Date:
                </span>{" "}
                {formatDate(new Date(computedData.startDate))}
              </p>

              <p className="flex items-center gap-2">
                <span className="flex items-center gap-1 font-bold">
                  <Calendar className="h-4" /> End Date:
                </span>{" "}
                {formatDate(new Date(computedData.endDate))}
              </p>

              <p className="flex items-center gap-2">
                <ChartColumn className="h-4" />
                <span className=" flex items-center gap-1 font-bold">
                  Status:
                </span>{" "}
                <span className="text-sm">
                  {computedData.status.replace("_", " ")}
                </span>
              </p>

              <p className="flex items-center gap-2">
                <Target className="h-4" />
                <span className="flex items-center gap-1 font-bold">
                  Progress:
                </span>{" "}
                <span>{computedData.progress}%</span>
              </p>
              <div className="flex items-center gap-2">
                <Clock className="h-4" />
                <span className="flex items-center gap-1 font-bold">
                  Hours:
                </span>{" "}
                {computedData.actualHours}h / {computedData.estimatedHours}h
              </div>
              <div className="pt-2">
                <hr />
              </div>
              <div className="flex flex-wrap gap-4 text-xs pt-2">
                <span className="flex gap-2 items-center justify-center font-semibold text-green-500">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  On Time
                </span>
                <span className="flex gap-2 items-center justify-center font-semibold text-yellow-500">
                  <span className="w-2 h-2 rounded-full bg-yellow-500" />
                  Slight Delay
                </span>
                <span className="flex gap-2 items-center justify-center font-semibold text-red-500">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  Delay
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Executive Summary */}
          <Card>
            <CardHeader className="flex justify-between items-center">
              <CardTitle className="text-2xl">
                Executive Summary Report
              </CardTitle>

              {/*  Replaced static text with DatePickerWithRange */}
              <DatePickerWithRange
                date={dateRange}
                onDateChange={handleDateRangeChange}
                minDate={normalizedMinDate}
                maxDate={normalizedMaxDate}
              />
            </CardHeader>

            <CardContent className="space-y-4 text-sm">
              <div className="space-y-2">
                <p>
                  {overdueTasks.length === 0 ? (
                    <span className="flex gap-2 font-semibold text-green-400">
                      <CircleCheck className="h-5" /> All sprint(s) are running
                      on time.
                    </span>
                  ) : (
                    <span className="flex gap-2 font-semibold text-red-400">
                      <CircleAlert className="h-5" /> {overdueTasks.length}{" "}
                      sprint(s) are running out of time.
                    </span>
                  )}
                </p>
                <p className="flex gap-2 font-semibold text-yellow-400">
                  <TriangleAlert className="h-5" /> No risk(s) are associated
                  with the project.
                </p>
                <p className="flex gap-2 font-semibold text-blue-400">
                  <Info className="h-5" />
                  {computedData.remainingTasks === 0 ? (
                    <span>All tasks have been completed.</span>
                  ) : (
                    <span>
                      {computedData.remainingTasks} task(s) remaining out of{" "}
                      {computedData.tasksTotal} total.
                    </span>
                  )}
                </p>
              </div>

              <div className="flex justify-around mt-8 pt-5 border-t">
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {computedData.tasksTotal}
                  </p>
                  <p className="text-sm text-gray-400">Total Tasks</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-500">
                    {computedData.tasksDone}
                  </p>
                  <p className="text-sm text-gray-400">Completed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-500">
                    {computedData.remainingTasks}
                  </p>
                  <p className="text-sm text-gray-400">Remaining</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Overdue Tasks Table */}
        <div className="mt-4 mb-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-medium">Overdue Tasks</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-gray-400">
              <DataTableLayout
                columns={overdueTasksColumns}
                data={overdueTasks}
                extraTools={{
                  totalPages: 1,
                  isLoading: isSprintLoading,
                  fileName: "Overdue Tasks Report",
                }}
              />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3! gap-6">
          <WeekSprintTable
            title="Current Week"
            data={currentWeekSprints}
            formatDate={formatDate}
          />
          <WeekSprintTable
            title="Previous Week"
            data={previousWeekSprints}
            formatDate={formatDate}
          />
          <WeekSprintTable
            title="Upcoming Week"
            data={upcomingWeekSprints}
            formatDate={formatDate}
          />
        </div>
      </div>
    </div>
  );
};

export default ProjectStatusDetailPage;
