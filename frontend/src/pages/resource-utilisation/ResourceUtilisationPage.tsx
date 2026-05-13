import React, { useState, useMemo } from "react";
import {
  Button,
  Card,
  ComboboxInput,
  DataTableLayout,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "ikon-react-components-lib";
import ProjectMemberView from "./components/ProjectMemberView";
import { CalendarDays, ChevronLeft, ChevronRight, FolderKanban, Users } from "lucide-react";
import { useGetProjectsQuery, type Project } from "@/features/projects/projectsApiSlice";
import { useGetTasksByProjectQuery, type Task } from "@/features/tasks/tasksApiSlice";
import { useGetWorklogsByProjectQuery, type TaskWorklog } from "@/features/worklogs/worklogsApiSlice";
import { useGetAllMyTasksQuery, type Task as MyTask } from "@/features/myTasks/mytasksApiSlice";
import { useGetAllMyTaskWorklogsQuery, type MyTaskWorklog } from "@/features/myTaskWorklogs/myTaskWorklogApiSlice";
import { getUserInfo, getAllUsers, DEFAULT_CAPACITY_HOURS } from "@/utils/userMap";
import ErrorState from "@/components/ErrorState";

// ── Types ──

type ResourceMember = {
  id: string;
  name: string;
  email: string;
  capacity: number;
  planned: number;
  actual: number;
};

type TimesheetRow = {
  userId: string;
  name: string;
  entries: Record<string, number>; // date → hours
};

// ── Week helpers ──

const getWeek = (date: Date) => {
  const start = new Date(date);
  const day = start.getDay();
  start.setDate(start.getDate() - day);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return new Date(d);
  });
};

const formatDate = (date: Date) =>
  date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    weekday: "short",
  });

const toKey = (date: Date) => date.toISOString().split("T")[0];

// ── Helper: aggregate tasks by assignee across all projects ──

function buildTeamMemberData(allTasks: Task[]): ResourceMember[] {
  const byAssignee: Record<string, { planned: number; actual: number }> = {};

  allTasks.forEach((task) => {
    const key = task.assigneeId || "unassigned";
    if (!byAssignee[key]) byAssignee[key] = { planned: 0, actual: 0 };
    byAssignee[key].planned += task.estimatedHours || 0;
    byAssignee[key].actual += task.actualHours || 0;
  });

  return Object.entries(byAssignee)
    .filter(([key]) => key !== "unassigned")
    .map(([userId, data]) => {
      const user = getUserInfo(userId);
      return {
        id: userId,
        name: user.name,
        email: user.email,
        capacity: DEFAULT_CAPACITY_HOURS,
        planned: Math.round(data.planned * 10) / 10,
        actual: Math.round(data.actual * 10) / 10,
      };
    });
}

// ── Helper: build timesheet from worklogs, keyed by task → assignee ──

function buildTimesheetData(
  allTasks: Task[],
  allWorklogs: TaskWorklog[],
  myTasks: MyTask[] = [],
  myTaskWorklogs: MyTaskWorklog[] = []
): TimesheetRow[] {

  // TASK -> ASSIGNEE MAP

  const taskAssigneeMap: Record<string, string> = {};

  allTasks.forEach((t) => {
    if (t.assigneeId) {
      taskAssigneeMap[t.id] = t.assigneeId;
    }
  });

  // MYTASK -> ASSIGNEE MAP

  const myTaskAssigneeMap: Record<string, string> = {};

  myTasks.forEach((t) => {
    if (t.assigneeId) {
      myTaskAssigneeMap[t.id] = t.assigneeId;
    }
  });

  // FINAL AGGREGATION OBJECT

  const byAssignee: Record<
    string,
    Record<string, number>
  > = {};

  // PRE-CREATE TASK ASSIGNEES

  allTasks.forEach((t) => {
    if (t.assigneeId && !byAssignee[t.assigneeId]) {
      byAssignee[t.assigneeId] = {};
    }
  });

  // PRE-CREATE MYTASK ASSIGNEES

  myTasks.forEach((t) => {
    if (t.assigneeId && !byAssignee[t.assigneeId]) {
      byAssignee[t.assigneeId] = {};
    }
  });

  // TASK WORKLOGS

  allWorklogs.forEach((wl) => {

    const assigneeId =
      taskAssigneeMap[wl.taskId];

    if (!assigneeId) return;

    const dist: Record<string, number> =
      wl.hoursDistribution || {};

    Object.entries(dist).forEach(
      ([date, hours]) => {

        byAssignee[assigneeId][date] =
          (byAssignee[assigneeId][date] || 0)
          + Number(hours);

      }
    );
  });

  // MYTASK WORKLOGS

  myTaskWorklogs.forEach((wl) => {

    const assigneeId =
      myTaskAssigneeMap[wl.myTaskId];

    if (!assigneeId) return;

    const dist: Record<string, number> =
      wl.hoursDistribution || {};

    Object.entries(dist).forEach(
      ([date, hours]) => {

        byAssignee[assigneeId][date] =
          (byAssignee[assigneeId][date] || 0)
          + Number(hours);

      }
    );
  });

  // CONVERT TO UI ROWS

  return Object.entries(byAssignee).map(
    ([userId, entries]) => {

      const user = getUserInfo(userId);

      return {
        userId,
        name: user?.name || "Unknown User",
        entries,
      };
    }
  );
}

// ── Aggregator component for fetching tasks/worklogs across all projects ──

function useAllProjectData(projects: Project[]) {
  // We'll fetch tasks for each project and combine them
  const projectIds = projects.map((p) => String(p.id));

  // RTK Query hooks — we call them in a consistent order using the project list
  // Since hooks can't be conditional, we always call them but skip when empty
  const taskQueries = projectIds.map((pid) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useGetTasksByProjectQuery(pid, { skip: !pid })
  );

  const worklogQueries = projectIds.map((pid) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useGetWorklogsByProjectQuery(pid, { skip: !pid })
  );

  const allTasks: Task[] = taskQueries.flatMap((q) => q.data ?? []);
  const allWorklogs: TaskWorklog[] = worklogQueries.flatMap((q) => q.data ?? []);

  // Fetch all myTasks and myTaskWorklogs
  const { data: allMyTasks = [], isLoading: myTasksLoading, isFetching: myTasksFetching, isError: myTasksError } = useGetAllMyTasksQuery();
  const { data: allMyTaskWorklogs = [], isLoading: myTaskWorklogsLoading, isFetching: myTaskWorklogsFetching, isError: myTaskWorklogsError } = useGetAllMyTaskWorklogsQuery();

  const isLoading =
    taskQueries.some((q) => q.isLoading) || worklogQueries.some((q) => q.isLoading) || myTasksLoading || myTaskWorklogsLoading;
  const isFetching =
    taskQueries.some((q) => q.isFetching) ||
    worklogQueries.some((q) => q.isFetching) ||
    myTasksFetching ||
    myTaskWorklogsFetching;
     const isError =
    taskQueries.some((q) => q.isError) ||
    worklogQueries.some((q) => q.isError) ||
    myTasksError ||
    myTaskWorklogsError;

  return { allTasks, allWorklogs, allMyTasks, allMyTaskWorklogs, isLoading, isFetching, isError };
}

// ── Main Component ──

const ResourceUtilisationPage: React.FC = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [userFilter, setUserFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");

  const { data: projects = [], isLoading: projectsLoading, isFetching: projectsFetching , isError: projectsError, refetch } = useGetProjectsQuery();
  const { allTasks, allWorklogs, allMyTasks, allMyTaskWorklogs, isLoading: dataLoading, isFetching: dataFetching, isError: dataError } = useAllProjectData(projects);

  const isLoading = projectsLoading || dataLoading;
  const isFetching = projectsFetching || dataFetching;
  const isError = projectsError || dataError;
 
  const weekDates = getWeek(startDate);

  // ── Filter options ──

  const userOptions = useMemo(() => {
    const knownUsers = getAllUsers();
    return [
      { label: "All Users", value: "all" },
      ...knownUsers.map((u) => ({ label: u.name, value: u.id })),
    ];
  }, []);

  const projectOptions = useMemo(() => {
    return [
      { label: "All Projects", value: "all" },
      { label: "My Tasks", value: "myTasks" },
      ...projects.map((p) => ({ label: p.projectName, value: String(p.id) })),
    ];
  }, [projects]);

  // ── Team Member View data ──

  const teamMemberData = useMemo(() => {
    let filtered = allTasks;
    if (userFilter !== "all") {
      filtered = filtered.filter((t) => t.assigneeId === userFilter);
    }
    if (projectFilter !== "all") {
      filtered = filtered.filter((t) => String(t.projectId) === projectFilter);
    }
    return buildTeamMemberData(filtered);
  }, [allTasks, userFilter, projectFilter]);

  // ── Timesheet data ──
const timesheetData = useMemo(() => {
  let filteredTasks = [...allTasks];
  let filteredWorklogs = [...allWorklogs];

  let filteredMyTasks = [...allMyTasks];
  let filteredMyTaskWorklogs = [...allMyTaskWorklogs];

  // PROJECT FILTER

  if (projectFilter !== "all" && projectFilter !== "myTasks") {
    // normal project selected

    filteredTasks = filteredTasks.filter(
      (t) => String(t.projectId) === projectFilter
    );

    const taskIds = new Set(filteredTasks.map((t) => t.id));

    filteredWorklogs = filteredWorklogs.filter((w) =>
      taskIds.has(w.taskId)
    );

    // remove my task data
    filteredMyTasks = [];
    filteredMyTaskWorklogs = [];
  }

  if (projectFilter === "myTasks") {
    // only myTasks mode

    filteredTasks = [];
    filteredWorklogs = [];
  }

  // USER FILTER

  if (userFilter !== "all") {
    // NORMAL TASKS

    filteredTasks = filteredTasks.filter(
      (t) => t.assigneeId === userFilter
    );

    const taskIds = new Set(filteredTasks.map((t) => t.id));

    filteredWorklogs = filteredWorklogs.filter((w) =>
      taskIds.has(w.taskId)
    );

    // MY TASKS

    filteredMyTasks = filteredMyTasks.filter(
      (t) => t.assigneeId === userFilter
    );
  }

  // IMPORTANT:
  // ALWAYS recalculate myTaskIds AFTER filtering

  const myTaskIds = new Set(
    filteredMyTasks.map((t) => t.id)
  );

  filteredMyTaskWorklogs = filteredMyTaskWorklogs.filter((w) =>
    myTaskIds.has(w.myTaskId)
  );

  console.log({
    filteredTasks,
    filteredWorklogs,
    filteredMyTasks,
    filteredMyTaskWorklogs,
  });

  return buildTimesheetData(
    filteredTasks,
    filteredWorklogs,
    filteredMyTasks,
    filteredMyTaskWorklogs
  );
}, [
  allTasks,
  allWorklogs,
  allMyTasks,
  allMyTaskWorklogs,
  userFilter,
  projectFilter,
]);

  // ── Team view columns ──

  const columns: any = [
    {
      accessorKey: "name",
      header: () => <div className="font-semibold">Team Member</div>,
      cell: ({ row }: { row: { original: ResourceMember } }) => {
        const user = row.original;
        return (
          <div>
            <div className="font-medium">{user.name}</div>
            <div className="text-xs text-gray-400">{user.email}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "capacity",
      header: () => <div className="font-semibold">Capacity</div>,
      cell: ({ row }: { row: { original: ResourceMember } }) => (
        <span>{row.original.capacity}h</span>
      ),
    },
    {
      accessorKey: "planned",
      header: () => <div className="font-semibold">Planned</div>,
      cell: ({ row }: { row: { original: ResourceMember } }) => (
        <span>{row.original.planned}h</span>
      ),
    },
    {
      accessorKey: "actual",
      header: () => <div className="font-semibold">Actual</div>,
      cell: ({ row }: { row: { original: ResourceMember } }) => (
        <span>{row.original.actual}h</span>
      ),
    },
    {
      id: "utilisation",
      header: () => <div className="font-semibold">Utilisation %</div>,
      cell: ({ row }: { row: { original: ResourceMember } }) => {
        const { capacity, actual } = row.original;
        const utilisation = capacity > 0 ? Math.round((actual / capacity) * 100) : 0;

        let color = "text-green-500";
        if (utilisation > 100) color = "text-red-500";
        else if (utilisation > 80) color = "text-yellow-500";

        return <span className={color}>{utilisation}%</span>;
      },
    },
  ];

  // ── Week navigation ──

  const prevWeek = () => {
    const d = new Date(startDate);
    d.setDate(d.getDate() - 7);
    setStartDate(d);
  };

  const nextWeek = () => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + 7);
    setStartDate(d);
  };

  const isSameWeek = (date1: Date, date2: Date) => {
    const getStart = (d: Date) => {
      const temp = new Date(d);
      temp.setDate(temp.getDate() - temp.getDay());
      temp.setHours(0, 0, 0, 0);
      return temp.getTime();
    };
    return getStart(date1) === getStart(date2);
  };

  const today = new Date();
  const isCurrentWeek = isSameWeek(startDate, today);
  const goToCurrentWeek = () => setStartDate(new Date());

  return (
     <div className="w-full">     
      {isFetching ? (
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="space-y-2">
            <Skeleton className="h-7 w-40 rounded-md" />
            <Skeleton className="h-4 w-52 mb-6 rounded-md" />
            <Skeleton className="h-8 w-120 rounded-md" />
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center mb-2">
            <Skeleton className="h-10 w-72 rounded-md" />

            <div className="flex gap-3">
              <Skeleton className="h-10 w-10 rounded-md" />
              <Skeleton className="h-10 w-10 rounded-md" />
              <Skeleton className="h-10 w-32 rounded-md" />
            </div>
          </div>

          {/* Table */}
          <Card className="p-4">
            {/* Table Header */}
            <div className="grid grid-cols-4 gap-4 border-b pb-4 mb-4">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>

            {/* Table Rows */}
            <div className="space-y-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="grid grid-cols-4 gap-4 items-center">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      ) : isError ? (
        <ErrorState message="We couldn’t load the resource utilisation data right now. Please try again after a moment." onRetry={refetch} />
      ) : (
        <div className="p-4 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold">Resource Utilisation</h1>
            <p className="text-muted-foreground">
              Monitor team capacity and workload across all projects.
            </p>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="team">
            <TabsList>
              <TabsTrigger value="team" className="flex gap-2 items-center">
                <Users className="h-4 w-4" /> Team Member View
              </TabsTrigger>
              <TabsTrigger value="project" className="flex gap-2 items-center">
                <FolderKanban className="h-4 w-4" /> Project View
              </TabsTrigger>
              <TabsTrigger
                value="timesheet"
                className="flex gap-2 items-center"
              >
                <CalendarDays className="h-4 w-4" /> Timesheet
              </TabsTrigger>
            </TabsList>

            {/* Team View */}
            <TabsContent value="team" className="mt-5">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading resource data...
                </div>
              ) : teamMemberData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No resource data available. Assign tasks to team members to
                  see utilisation.
                </div>
              ) : (
                <DataTableLayout
                  data={teamMemberData}
                  columns={columns}
                  extraTools={{ totalPages: 1 }}
                />
              )}
            </TabsContent>

            {/* Project View */}
            <TabsContent value="project" className="mt-5">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading projects...
                </div>
              ) : (
                <ProjectMemberView projects={projects} allTasks={allTasks} />
              )}
            </TabsContent>

            {/* Timesheet */}
            <TabsContent value="timesheet" className="mt-5">
              {/* Controls */}
              <div className="flex flex-col gap-3 mb-4 md:flex-row md:items-center md:justify-between">
                {/* LEFT: Week Navigation */}
                <div className="flex items-center gap-2 flex-wrap justify-between md:justify-start">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={prevWeek}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="font-medium whitespace-nowrap text-sm md:text-base">
                      {formatDate(weekDates[0])} — {formatDate(weekDates[6])}
                    </span>
                    <Button variant="outline" size="icon" onClick={nextWeek}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  {!isCurrentWeek && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToCurrentWeek}
                    >
                      This Week
                    </Button>
                  )}
                </div>

                {/* RIGHT: Filters */}
                <div className="flex flex-col gap-2 w-full md:flex-row md:w-auto md:items-center">
                  <div className="w-full md:w-[180px]">
                    <ComboboxInput
                      placeholder="All Users"
                      items={userOptions}
                      defaultValue={userFilter}
                      onSelect={(value) => setUserFilter(value as string)}
                    />
                  </div>
                  <div className="w-full md:w-[180px]">
                    <ComboboxInput
                      placeholder="All Projects"
                      items={projectOptions}
                      defaultValue={projectFilter}
                      onSelect={(value) => setProjectFilter(value as string)}
                    />
                  </div>
                </div>
              </div>

              {/* Timesheet Table */}
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader className="h-11 bg-muted font-extrabold">
                    <TableRow>
                      <TableHead>Assignee</TableHead>
                      {weekDates.map((date) => (
                        <TableHead key={date.toISOString()}>
                          {formatDate(date)}
                        </TableHead>
                      ))}
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                    <TableCell colSpan={weekDates.length + 2} className="text-center">
                          Loading timesheet...
                        </TableCell>
                      </TableRow>
                    ) : timesheetData.length === 0 ? (
                      <TableRow>
                    <TableCell colSpan={weekDates.length + 2} className="text-center">
                          No time logged
                        </TableCell>
                      </TableRow>
                    ) : (
                      timesheetData.map((row) => {
                        const total = weekDates.reduce((sum, date) => {
                          const key = toKey(date);
                          return sum + (row.entries[key] || 0);
                        }, 0);

                        return (
                          <TableRow key={row.userId}>
                            <TableCell>{row.name}</TableCell>
                            {weekDates.map((date) => {
                              const key = toKey(date);
                              const hrs = row.entries[key] || 0;
                              return (
                                <TableCell key={key}>
                                  {hrs ? `${hrs}h` : "-"}
                                </TableCell>
                              );
                            })}
                            <TableCell className="font-semibold">
                                 {total}h
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default ResourceUtilisationPage;