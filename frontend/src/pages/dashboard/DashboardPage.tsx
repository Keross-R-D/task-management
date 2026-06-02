import React, { useEffect, useMemo, useState } from "react";
import StatsCard from "../myTasks/components/StatsCard";
import { CalendarClock, ChartPie, FolderKanban, LayoutList, ListTodo, LoaderCircle, NotepadText, SquareCheckBig, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardTitle, EChart, Progress, Separator, Skeleton } from "ikon-react-components-lib";
import ProjectCard from "./components/ProjectCard";
import { useNavigate } from "react-router-dom";
import { appPath } from "@/utils/basePath";
import { useGetMyTasksQuery } from "@/features/myTasks/mytasksApiSlice";
import { useGetProjectsQuery } from "@/features/projects/projectsApiSlice";
import type { Task as ProjectTask } from "@/features/tasks/tasksApiSlice";
import { useLazyGetTasksByProjectQuery } from "@/features/tasks/tasksApiSlice";
import ErrorState from "@/components/ErrorState";
import { useUserMap } from "@/utils/userMap";
import RecentTasksTable from "./components/RecentTasksTable";

//Types
type Task = {
  id: string;
  name: string;
  actualHours: number;
  estimatedHours: number;
  status: "Todo" | "In progress" | "Done" | "Blocked";
  priority: "Low" | "Medium" | "High";
  type: "Task" | "Bug" | "Improvement";
  assignee: string;
  updatedAt: string;
};

type ProjectTaskWithProject = ProjectTask & {
  projectName: string;
};

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    data: projects = [],
    isLoading: isProjectLoading,
    isFetching: isProjectFetching,
    refetch,
  } = useGetProjectsQuery();
  const { data, isLoading, isError,isFetching: isDataFetching } = useGetMyTasksQuery();
  const [getTasksByProject] = useLazyGetTasksByProjectQuery();
  const [projectTasks, setProjectTasks] = useState<ProjectTaskWithProject[]>(
    [],
  );

  const isFetching = isProjectFetching || isDataFetching;
  const { getUserInfo } = useUserMap();

  //Project tasks data
  useEffect(() => {
    if (!projects.length) return;

    const loadProjectTasks = async () => {
      const results = await Promise.all(
        projects.map(async (project) => {
          const tasks = await getTasksByProject(String(project.id)).unwrap();
          return tasks.map((t) => ({
            ...t,
            projectName: project.projectName,
          }));
        }),
      );

      setProjectTasks(results.flat());
    };

    loadProjectTasks();
  }, [projects, getTasksByProject]);

  //Bar chart data
  const chartData = useMemo(() => {
    const map: Record<string, { estimated: number; actual: number }> = {};

    projectTasks.forEach((t) => {
      if (!map[t.projectName]) {
        map[t.projectName] = { estimated: 0, actual: 0 };
      }
      map[t.projectName].estimated += t.estimatedHours || 0;
      map[t.projectName].actual += t.actualHours || 0;
    });

    return Object.entries(map).map(([name, values]) => ({
      name,
      estimated: values.estimated,
      actual: values.actual,
    }));
  }, [projectTasks]);

  //formatting status
  const formatStatus = (status: string): Task["status"] => {
    switch (status) {
      case "TO_DO":
        return "Todo";
      case "IN_PROGRESS":
        return "In progress";
      case "DONE":
        return "Done";
      case "BLOCKED":
        return "Blocked";
      default:
        return "Todo";
    }
  };

  //formatting priority
  const formatPriority = (priority: string): Task["priority"] => {
    switch (priority) {
      case "LOW":
        return "Low";
      case "MEDIUM":
        return "Medium";
      case "HIGH":
        return "High";
      default:
        return "Low";
    }
  };

  //formatting status
  const formatType = (type: string): string => {
    switch (type) {
      case "TASK":
        return "Task";
      case "BUG":
        return "Bug";
      case "IMPROVEMENT":
        return "Improvement";
      default:
        return "Task";
    }
  };

  const tasks = data?.content?.map((task) => ({
    id: task.id,
    name: task.taskTitle,
    status: formatStatus(task.taskStatus),
    actualHours: task.actualHours,
    estimatedHours: task.estimatedHours,
    priority: formatPriority(task.taskPriority),
    type: formatType(task.taskType),
    assignee: getUserInfo(task.assigneeId).name,
    updatedAt: task.updatedAt
  })) || [];

  const formattedProjectTasks = projectTasks.map((task) => ({
    id: task.id,
    name: task.title,
    status: formatStatus(task.status.toUpperCase()),
    actualHours: task.actualHours,
    estimatedHours: task.estimatedHours,
    priority: formatPriority(task.priority.toUpperCase()),
    type: formatType(task.type.toUpperCase()),
    assignee: getUserInfo(task.assigneeId).name,
    updatedAt: task.updatedAt
  }));

  //Calculations
  const allTasks = [...tasks, ...formattedProjectTasks];

  const total = allTasks.length;

  const todo = allTasks.filter((t) => t.status === "Todo").length;

  const inProgress = allTasks.filter((t) => t.status === "In progress").length;

  const done = allTasks.filter((t) => t.status === "Done").length;

  const blocked = allTasks.filter((t) => t.status === "Blocked").length;

  const low = allTasks.filter((t) => t.priority === "Low").length;

  const medium = allTasks.filter((t) => t.priority === "Medium").length;

  const high = allTasks.filter((t) => t.priority === "High").length;

  const taskPercentage = total === 0 ? 0 : Math.round((done / total) * 100);

  const totalEstimatedHours = allTasks.reduce(
    (sum, t) => sum + (t.estimatedHours || 0),
    0,
  );

  const totalActualHours = allTasks.reduce(
    (sum, t) => sum + (t.actualHours || 0),
    0,
  );

  const hoursPercentage =
    totalEstimatedHours === 0
      ? 0
      : Math.round((totalActualHours / totalEstimatedHours) * 100);

  //Bar chart options
  const optionBar = {
    tooltip: { trigger: "axis" },
    legend: { data: ["Estimated", "Actual"] },

    xAxis: {
      type: "category",
      data: chartData.map((p) => p.name),
    },

    yAxis: { type: "value" },

    series: [
      {
        name: "Estimated",
        type: "bar",
        data: chartData.map((p) => p.estimated),
        itemStyle: { color: "#2a3441" },
      },
      {
        name: "Actual",
        type: "bar",
        data: chartData.map((p) => p.actual),
        itemStyle: { color: "#6366f1" },
      },
    ],
  };

  //Pie chart options
  const optionPie = {
    tooltip: {
      trigger: "item",
    },
    legend: {
      bottom: 0,
      textStyle: {
        color: "#9ca3af",
      },
    },
    series: [
      {
        name: "Tasks",
        type: "pie",
        radius: ["60%", "80%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderWidth: 1,
        },
        label: {
          show: false,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: "bold",
          },
        },
        data: [
          { value: todo, name: "Todo", itemStyle: { color: "#9ca3af" } },
          { value: done, name: "Done", itemStyle: { color: "#22c55e" } },
          {
            value: inProgress,
            name: "In Progress",
            itemStyle: { color: "#6366f1" },
          },
          { value: blocked, name: "Blocked", itemStyle: { color: "red" } },
        ],
      },
    ],
    graphic: [
      {
        type: "text",
        left: "center",
        top: "center",
        style: {
          text: `${total}\nTotal`,
          textAlign: "center",
          fill: "#9ca3af",
          fontSize: 20,
          fontWeight: 600,
          lineHeight: 26,
        },
      },
    ],
  };

  //Show only the 5 recent tasks
  const recentTasks = [...allTasks]
    .sort(
      (a, b) =>
        new Date(b.updatedAt || 0).getTime() -
        new Date(a.updatedAt || 0).getTime()
    )
    .slice(0, 5);

  return (
    <>
      {isFetching ? (
        <div className="p-4 overflow-hidden">
          {/* Header */}
          <div className="space-y-2 mb-6">
            <Skeleton className="h-8 w-52 rounded-md" />
            <Skeleton className="h-4 w-80 rounded-md" />
          </div>

          {/* Stats Cards */}
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-14" />
                    <Skeleton className="h-3 w-24" />
                  </div>

                  <Skeleton className="h-10 w-10 rounded-xl" />
                </div>
              </Card>
            ))}
          </div>

          {/* Main Charts */}
          <div className="grid xl:grid-cols-3 gap-6 h-[53vh]">
            {/* Left Chart */}
            <Card className="xl:col-span-2 p-4">
              <div className="flex items-center gap-2 mb-5">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-6 w-48 rounded" />
              </div>

              {/* Progress */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-full" />
                </div>

                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>

              {/* Chart */}
              <Skeleton className="h-[260px] w-full rounded-xl" />
            </Card>

            {/* Pie Chart */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-5">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-6 w-36 rounded" />
              </div>

              <div className="flex justify-center items-center mb-6">
                <Skeleton className="h-44 w-44 rounded-full" />
              </div>

              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Skeleton className="w-3 h-3 rounded-full" />
                      <Skeleton className="h-4 w-20" />
                    </div>

                    <Skeleton className="h-4 w-8" />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      ) : isError ? (
        <ErrorState
          message="We couldn’t load the dashboard data right now. Please try again after a moment."
          onRetry={() => refetch()}
        />
      ) : (
        <div className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">DashBoard</h1>
              <p className="text-muted-foreground mt-0.5">
                Welcome back. Here's what's happening across your projects.
              </p>
            </div>
          </div>
          <div className="grid mt-5 mb-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <StatsCard
              title="Total"
              description="Total projects"
              value={projects.length}
              color="text-indigo-500"
              bg="bg-indigo-500/10"
              Icon={LayoutList}
            />

            <StatsCard
              title="Active"
              description="Active Projects"
              value={0}
              color="text-amber-500"
              bg="bg-amber-500/10"
              Icon={FolderKanban}
            />

            <StatsCard
              title="Total"
              description="Total tasks"
              value={total}
              color="text-indigo-500"
              bg="bg-indigo-500/10"
              Icon={NotepadText}
            />

            <StatsCard
              title="To Do"
              description="Pending tasks"
              value={todo}
              color="text-blue-500"
              bg="bg-blue-500/10"
              Icon={ListTodo}
            />

            <StatsCard
              title="In Progress"
              description="Ongoing tasks"
              value={inProgress}
              color="text-yellow-500"
              bg="bg-yellow-500/10"
              Icon={LoaderCircle}
            />

            <StatsCard
              title="Done"
              description="Completed tasks"
              value={done}
              color="text-green-500"
              bg="bg-green-500/10"
              Icon={SquareCheckBig}
            />
          </div>

          <div className="grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-3 gap-6 mb-4">
            {/* Effort By Project */}
            <Card className="lg:col-span-2 p-4">
              <CardTitle className="flex gap-2 items-center text-lg font-semibold">
                <TrendingUp className="text-indigo-500" />
                Effort By Projects
              </CardTitle>
              <CardContent className="px-2 space-y-4">
                <div className="grid lg:grid-cols-2 gap-6 space-y-3">
                  {/* Task Completion */}
                  <div className="col-span-1">
                    <span className="font-semibold text-muted-foreground">Task Completion</span>
                    <div className="flex justify-between mb-2">
                      <p className="text-2xl font-bold">{done} <span className="text-muted-foreground text-lg font-normal">/ {total}</span></p>
                      <span className="font-medium text-xl text-green-500">{taskPercentage} %</span>
                    </div>
                    <Progress value={taskPercentage} className="[&>div]:bg-green-500"/>
                  </div>

                  {/* Hours Logged */}
                  <div className="col-span-1">
                    <span className="font-semibold text-muted-foreground">Hours Logged</span>
                    <div className="flex justify-between mb-2">
                      <p className="text-2xl font-bold">{totalActualHours} <span className="text-muted-foreground text-lg font-normal">/ {totalEstimatedHours}</span></p>
                      <span className="font-medium text-xl text-green-500">{hoursPercentage} %</span>
                    </div>
                    <Progress value={hoursPercentage} className="[&>div]:bg-green-500"/>
                  </div>
                </div>
                <div className="flex items-center justify-center text-muted-foreground">
                  {/* You can place chart / icon here */}
                  <EChart
                    option={optionBar}
                    style={{ height: "380px", width: "100%" }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Task Distribution */}
            <Card className="p-4">
              <CardTitle className="flex gap-2 items-center text-lg font-semibold">
                <ChartPie className="text-blue-500" />
                Task Distribution
              </CardTitle>
              <CardContent className="p-2 space-y-4">
                <EChart
                  option={optionPie}
                  style={{ height: "260px", width: "100%" }}
                />
                <div>
                  <span className="flex justify-between">
                    <span className="flex gap-3 items-center justify-center font-semibold">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      Todo
                    </span>
                    <span className="font-semibold">{todo}</span>
                  </span>
                  <span className="flex justify-between">
                    <span className="flex gap-3 items-center justify-center font-semibold">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      Done
                    </span>
                    <span className="font-semibold">{done}</span>
                  </span>
                  <span className="flex justify-between">
                    <span className="flex gap-3 items-center justify-center font-semibold">
                      <span className="w-2 h-2 rounded-full bg-yellow-500" />
                      In Progress
                    </span>
                    <span className="font-semibold">{inProgress}</span>
                  </span>
                  <span className="flex justify-between">
                    <span className="flex gap-3 items-center justify-center font-semibold">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      Blocked
                    </span>
                    <span className="font-semibold">{blocked}</span>
                  </span>
                </div>
                <Separator />
                <div>
                  <span className="flex justify-between">
                    <span className="flex gap-3 items-center justify-center font-semibold">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      Low
                    </span>
                    <span className="font-semibold">{low}</span>
                  </span>
                  <span className="flex justify-between">
                    <span className="flex gap-3 items-center justify-center font-semibold">
                      <span className="w-2 h-2 rounded-full bg-yellow-500" />
                      Medium
                    </span>
                    <span className="font-semibold">{medium}</span>
                  </span>
                  <span className="flex justify-between">
                    <span className="flex gap-3 items-center justify-center font-semibold">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      High
                    </span>
                    <span className="font-semibold">{high}</span>
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Recent Tasks */}
            <Card className="lg:col-span-2 p-4">
              <div className="flex justify-between">
                <CardTitle className="flex gap-2 items-center text-lg font-semibold">
                  <CalendarClock className="text-indigo-500" />
                  Recent Tasks
                </CardTitle>
                <button
                  onClick={() => navigate(appPath("/tasks"))}
                  className="flex items-center gap-2 cursor-pointer text-indigo-500 hover:text-indigo-600"
                >
                  View All
                </button>
              </div>
              <div>
                <RecentTasksTable
                  tasks={recentTasks}
                  isLoading={isLoading}
                />
              </div>
              <CardContent className="p-2 space-y-4"></CardContent>
            </Card>

            <div className="grid xl:grid-cols-3 gap-6">
              {/* Projects */}
              <Card className="p-4 xl:col-span-3">
                <div className="flex justify-between">
                  <CardTitle className="flex gap-2 items-center text-lg font-semibold">
                    <FolderKanban className="text-amber-500" />
                    Projects
                  </CardTitle>
                  <button
                    onClick={() => navigate(appPath("/projects"))}
                    className="flex items-center gap-2 cursor-pointer text-indigo-500 hover:text-indigo-600"
                  >
                    View All
                  </button>
                </div>
                <CardContent className="p-2 space-y-4 max-h-[420px] overflow-y-auto custom-scrollbar">
                  {/* <style>{`div::-webkit-scrollbar { display: none; }`}</style> */}
                  {isProjectLoading ? (
                    <p className="text-sm text-muted-foreground">Loading...</p>
                  ) : projects.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No projects found
                    </p>
                  ) : (
                    projects.map((project) => (
                      <ProjectCard
                        key={project.id}
                        id={String(project.id)}
                        name={project.projectName}
                        status={project.projectStatus}
                      />
                    ))
                  )}
                </CardContent>
              </Card>
              <Card className="p-4 xl:col-span-3">
                <div className="flex justify-between">
                  <CardTitle className="flex gap-2 items-center text-lg font-semibold">
                    <Users className="text-indigo-500" />
                    Team Workload
                  </CardTitle>
                  <button
                    onClick={() => navigate(appPath("/resource-utilisation"))}
                    className="flex items-center gap-2 cursor-pointer text-indigo-500 hover:text-indigo-600"
                  >
                    Details
                  </button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardPage;
