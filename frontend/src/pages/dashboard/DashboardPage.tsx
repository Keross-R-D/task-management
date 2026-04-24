import React from "react";
import StatsCard from "../myTasks/components/StatsCard";
import { ArrowDown, ArrowUp, Ban, CalendarClock, ChartPie, CheckCircle2, CircleUser, Clock, Flame, FolderKanban, LayoutList, ListTodo, LoaderCircle, NotepadText, SquareCheckBig, TrendingUp } from "lucide-react";
import { Card, CardContent, CardTitle, DataTableLayout, EChart, Progress, Separator } from "ikon-react-components-lib";
import { useNavigate } from "react-router-dom";
import { useGetMyTasksQuery, userMap } from "@/features/myTasks/mytasksApiSlice";

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useGetMyTasksQuery();

  //Type
  type Task = {
      id: string;
      name: string;
      estimatedHours: number,
      status: "Todo" | "In progress" | "Done" | "Blocked";
      priority: "Low" | "Medium" | "High";
      type: "Task" | "Bug" | "Improvement",
      assignee: string
  };
  
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
  
  const reverseUserMap: Record<string, string> = Object.fromEntries(
      Object.entries(userMap).map(([key, value]) => [value, key])
  );
  
  //Map assignee
  const mapAssignee = (ids: string[] = []) => {
      if (!ids || ids.length === 0) return "";
      return reverseUserMap[ids[0]] || "";
  };

  const tasks = data?.content?.map((task) => ({
        id: task.id,
        name: task.taskTitle,
        status: formatStatus(task.taskStatus),
        estimatedHours: task.estimatedHours,
        priority: formatPriority(task.taskPriority),
        type: formatType(task.taskType),
        assignee: mapAssignee(task.assigneeIds)
    })) || [];

  const total = tasks.length;

  const todo = tasks.filter(t => t.status === "Todo").length;

  const inProgress = tasks.filter(t => t.status === "In progress").length;

  const done = tasks.filter(t => t.status === "Done").length;

  const blocked = tasks.filter(t => t.status === "Blocked").length;

  const low = tasks.filter(t => t.priority === "Low").length;

  const medium = tasks.filter(t => t.priority === "Medium").length;

  const high = tasks.filter(t => t.priority === "High").length;

  //Bar chart options
  const optionBar = {
    tooltip: {
      trigger: "axis",
    },
    legend: {
      data: ["Estimated", "Actual"],
    },
    xAxis: {
      type: "category",
      data: ["Project 1", "Project 2"],
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        name: "Estimated",
        type: "bar",
        data: [90, 15],
        itemStyle: {
          color: "#2a3441",
        },
      },
      {
        name: "Actual",
        type: "bar",
        data: [20, 10],
        itemStyle: {
          color: "#6366f1",
        },
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
          borderRadius: 6,
          borderWidth: 2,
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
          { value: inProgress, name: "In Progress", itemStyle: { color: "#6366f1" } },
          { value: blocked, name: "Blocked", itemStyle: { color: "red" } }
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

  //Task DataTable columns
  const columns = [
    {
      accessorKey: "name",
      header: "Task",
      cell: ({ row }: { row: { original: Task } }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: { row: { original: Task } }) => {
          const status = row.original.status;

          const styles: Record<Task["status"], string> = {
              Todo: "bg-blue-500/10 text-blue-500",
              "In progress": "bg-yellow-500/10 text-yellow-500",
              Done: "bg-green-500/10 text-green-500",
              Blocked: "bg-red-500/10 text-red-500",
          };

          return (
              <span className={`px-2 py-1 rounded-md text-sm font-medium ${styles[status]}`}>
                  {status}
              </span>
          );
      },
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }: { row: { original: Task } }) => {
          const priority = row.original.priority;

          const styles: Record<Task["priority"], string> = {
              Low: "text-green-500",
              Medium: "text-yellow-500",
              High: "text-red-500",
          };

          return (
              <span className={`font-semibold ${styles[priority]}`}>
                  {priority}
              </span>
          );
      },
    },
    {
      accessorKey: "assignee",
      header: "Assignee",
      cell: ({ row }: { row: { original: Task } }) => {
          const assignee = row.original.assignee.split(' ')
              .map(word =>
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
              )
              .join(' ');

          return (
              <span className="flex gap-1 items-center font-semibold bg-muted w-fit rounded-md px-1.5 py-1">
                  {assignee}
              </span>
          );
      },
    },
  ];

  //Task grid view
  const renderGrid = (data: Task[]) => {
    const statusIcons: Record<Task["status"], React.ReactNode> = {
        Todo: <ListTodo className="h-3.5 w-3.5" />,
        "In progress": <Clock className="h-3.5 w-3.5" />,
        Done: <CheckCircle2 className="h-3.5 w-3.5" />,
        Blocked: <Ban className="h-3.5 w-3.5" />,
    };

    const priorityIcons: Record<Task["priority"], React.ReactNode> = {
        Low: <ArrowDown className="h-4 w-4" />,
        Medium: <ArrowUp className="h-4 w-4" />,
        High: <Flame className="h-4 w-4" />,
    };

    const statusStyles: Record<Task["status"], string> = {
        Todo: "text-indigo-500",
        "In progress": "text-yellow-500",
        Done: "text-green-500",
        Blocked: "text-red-500",
    };

    const statusBorderStyles: Record<Task["status"], string> = {
        Todo: "border-t-indigo-500",
        "In progress": "border-t-yellow-500",
        Done: "border-t-green-500",
        Blocked: "border-t-red-500",
    };

    const priorityStyles: Record<Task["priority"], string> = {
        Low: "bg-green-500/10 text-green-500",
        Medium: "bg-yellow-500/10 text-yellow-500",
        High: "bg-red-500/10 text-red-500",
    };

    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((task) => (
          <div
            key={task.id}
            className={`p-5 border rounded-xl shadow-muted bg-muted/30 relative border-t-2 ${statusBorderStyles[task.status]}`}
          >
            <h3 className="text-lg font-semibold px-0.5 mb-1">{task.name}</h3>

            <div className={`flex gap-1 items-center text-sm font-semibold mb-4 ${statusStyles[task.status]}`}>
              {statusIcons[task.status]}
              {task.status}
            </div>

            <div className={`flex gap-1 items-center px-2 py-1 mt-1 rounded-md text-sm font-medium w-fit ${priorityStyles[task.priority]}`}>
              {priorityIcons[task.priority]}
              {task.priority}
            </div>

            <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
              <CircleUser className="h-3 w-3" />Assigned to: <span className="font-medium">{task.assignee.split(' ')
              .map(word =>
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
              )
              .join(' ') || "Unassigned"}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center">
          <div>
              <h1 className="text-2xl font-bold">DashBoard</h1>
              <p className="text-muted-foreground">Welcome back. Here's what's happening across your projects.</p>
          </div>
      </div>
      <div className="grid mt-5 mb-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatsCard title="Total" description="Total projects" value={0} color="text-indigo-500" bg="bg-indigo-500/10" Icon={LayoutList} />

          <StatsCard title="Active" description="Active Projects" value={0} color="text-amber-500" bg="bg-amber-500/10" Icon={FolderKanban} />

          <StatsCard title="Total" description="Total tasks" value={total} color="text-indigo-500" bg="bg-indigo-500/10" Icon={NotepadText} />

          <StatsCard title="To Do" description="Pending tasks" value={todo} color="text-blue-500" bg="bg-blue-500/10" Icon={ListTodo} />

          <StatsCard title="In Progress" description="Ongoing tasks" value={inProgress} color="text-yellow-500" bg="bg-yellow-500/10" Icon={LoaderCircle} />

          <StatsCard title="Done" description="Completed tasks" value={done} color="text-green-500" bg="bg-green-500/10" Icon={SquareCheckBig} />
      </div>

      <div className="grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-3 gap-6 mb-4">
        {/* Effort By Project */}
        <Card className="lg:col-span-2 p-4">
          <CardTitle className="flex gap-2 items-center text-lg font-semibold"><TrendingUp className="text-indigo-500"/>Effort By Projects</CardTitle>
          <CardContent className="p-2 space-y-4">
            <div className="grid lg:grid-cols-2 gap-6 space-y-3">
                {/* Task Completion */}
                <div className="col-span-1">
                  <span className="font-semibold text-lg">Task Completion</span>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">2 / 8</span>
                    <span className="font-medium">25%</span>
                  </div>
                  <Progress value={25} />
                </div>

                {/* Hours Logged */}
                <div className="col-span-1">
                  <span className="font-semibold text-lg">Hours Logged</span>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">0 / 203</span>
                    <span className="font-medium">10%</span>
                  </div>
                  <Progress value={10} />
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
          <CardTitle className="flex gap-2 items-center text-lg font-semibold"><ChartPie className="text-blue-500"/>Task Distribution</CardTitle>
          <CardContent className="p-2 space-y-4">
            <EChart
              option={optionPie}
              style={{ height: "260px", width: "100%" }}
            />
            <div>
              <span className="flex justify-between">
                <span className="flex gap-3 items-center justify-center font-semibold"><span className="w-2 h-2 rounded-full bg-blue-500" />Todo</span><span className="font-semibold">{todo}</span>
              </span>
              <span className="flex justify-between">
                <span className="flex gap-3 items-center justify-center font-semibold"><span className="w-2 h-2 rounded-full bg-green-500" />Done</span><span className="font-semibold">{done}</span>
              </span>
              <span className="flex justify-between">
                <span className="flex gap-3 items-center justify-center font-semibold"><span className="w-2 h-2 rounded-full bg-yellow-500" />In Progress</span><span className="font-semibold">{inProgress}</span>
              </span>
              <span className="flex justify-between">
                <span className="flex gap-3 items-center justify-center font-semibold"><span className="w-2 h-2 rounded-full bg-red-500" />Blocked</span><span className="font-semibold">{blocked}</span>
              </span>
            </div>
            <Separator />
            <div>
              <span className="flex justify-between">
                <span className="flex gap-3 items-center justify-center font-semibold"><span className="w-2 h-2 rounded-full bg-green-500" />Low</span><span className="font-semibold">{low}</span>
              </span>
              <span className="flex justify-between">
                <span className="flex gap-3 items-center justify-center font-semibold"><span className="w-2 h-2 rounded-full bg-yellow-500" />Medium</span><span className="font-semibold">{medium}</span>
              </span>
              <span className="flex justify-between">
                <span className="flex gap-3 items-center justify-center font-semibold"><span className="w-2 h-2 rounded-full bg-red-500" />High</span><span className="font-semibold">{high}</span>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Effort By Project */}
        <Card className="lg:col-span-2 p-4">
          <div className="flex justify-between">
            <CardTitle className="flex gap-2 items-center text-lg font-semibold"><CalendarClock className="text-indigo-500"/>Recent Tasks</CardTitle>
            <button
              onClick={() => navigate("/main/tasks")}
              className="flex items-center gap-2 cursor-pointer text-indigo-500 hover:text-indigo-600"
            >
              View All
            </button>
          </div>
          <div>
            <DataTableLayout data={tasks} columns={columns}
              extraTools={{
                totalPages: 2,
                toggleViewMode: true,
                isLoading: isLoading,
                gridComponent: renderGrid
              }}
            />
          </div>
          <CardContent className="p-2 space-y-4">
            
          </CardContent>
        </Card>

        {/* Task Distribution */}
        <Card className="p-4">
          <div className="flex justify-between">
            <CardTitle className="flex gap-2 items-center text-lg font-semibold"><FolderKanban className="text-amber-500"/>Projects</CardTitle>
            <button
              onClick={() => navigate("/main/projects")}
              className="flex items-center gap-2 cursor-pointer text-indigo-500 hover:text-indigo-600"
            >
              View All
            </button>
          </div>
          <CardContent className="p-2 space-y-4">
            
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
