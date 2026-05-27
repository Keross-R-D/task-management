import ErrorState from "@/components/ErrorState";
import { useGetProjectsQuery } from "@/features/projects/projectsApiSlice";
import { useLazyGetTasksByProjectQuery } from "@/features/tasks/tasksApiSlice";
import {
  Card,
  DataTableLayout,
  Progress,
  Skeleton,
} from "ikon-react-components-lib";

import React from "react";
import { useNavigate } from "react-router-dom";

type ProjectSummary = {
  id: string;
  projectName: string;
  status: string;
  progress: number;
  tasksDone: number;
  tasksTotal: number;
  estimatedHours: number;
  actualHours: number;
  variance: number;
  startDate: string;
  endDate: string;
};

const ProjectStatusReportPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: projects = [], isLoading,isFetching, isError,refetch } = useGetProjectsQuery();
  const [getTasksByProject] = useLazyGetTasksByProjectQuery();

  const [projectData, setProjectData] = React.useState<ProjectSummary[]>([]);

  React.useEffect(() => {
    if (!projects.length) return;

    const loadData = async () => {
      const results = await Promise.all(
        projects.map(async (project) => {
          const tasks = await getTasksByProject(String(project.id)).unwrap();

          const tasksTotal = tasks.length;

          const tasksDone = tasks.filter((t) => t.status === "DONE").length;

          const estimatedHours = tasks.reduce(
            (sum, t) => sum + (t.estimatedHours || 0),
            0,
          );

          const actualHours = tasks.reduce(
            (sum, t) => sum + (t.actualHours || 0),
            0,
          );

          const progress =
            tasksTotal > 0 ? Math.round((tasksDone / tasksTotal) * 100) : 0;

          const variance = estimatedHours - actualHours;

          return {
            id: String(project.id),
            projectName: project.projectName,
            status: project.projectStatus,
            progress,
            tasksDone,
            tasksTotal,
            estimatedHours,
            actualHours,
            variance,
            startDate: project.startDate,
            endDate: project.endDate,
          };
        }),
      );

      setProjectData(results);
    };

    loadData();
  }, [projects, getTasksByProject]);

  const projectColumns = [
    {
      accessorKey: "projectName",
      header: () => <div className="font-semibold">Project Name</div>,
      cell: ({ row }: { row: { original: ProjectSummary } }) => (
        <div
          className="font-medium cursor-pointer"
          onClick={() =>
            navigate(`/project-status-report/${row.original.id}`)
          }
        >
          {row.original.projectName}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: () => <div className="font-semibold">Status</div>,
      cell: ({ row }: { row: { original: ProjectSummary } }) => (
        <span className="px-2 py-1 text-xs rounded-full">
          {row.original.status.replace("_", " ")}
        </span>
      ),
    },
    {
      accessorKey: "progress",
      header: () => <div className="font-semibold">Progress</div>,
      cell: ({ row }: { row: { original: ProjectSummary } }) => {
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
    {
      id: "tasks",
      header: () => <div className="font-semibold">Tasks (Done/Total)</div>,
      cell: ({ row }: { row: { original: ProjectSummary } }) => {
        const { tasksDone, tasksTotal } = row.original;
        return (
          <span>
            {tasksDone} / {tasksTotal}
          </span>
        );
      },
    },
    {
      accessorKey: "estimatedHours",
      header: () => <div className="font-semibold">Estimated Hours</div>,
      cell: ({ row }: { row: { original: ProjectSummary } }) => (
        <span>{row.original.estimatedHours}h</span>
      ),
    },
    {
      accessorKey: "actualHours",
      header: () => <div className="font-semibold">Actual Hours</div>,
      cell: ({ row }: { row: { original: ProjectSummary } }) => (
        <span>{row.original.actualHours}h</span>
      ),
    },
    {
      accessorKey: "variance",
      header: () => <div className="font-semibold">Variance</div>,
      cell: ({ row }: { row: { original: ProjectSummary } }) => {
        const variance = row.original.variance;

        let color = "bg-gray-200/60 text-gray-900";
        if (variance > 0) color = "bg-red-500/10 text-red-500";

        return (
          <span className={`px-2 py-1 rounded text-xs ${color}`}>
            {variance > 0 ? `+${variance}h` : `${variance}h`}
          </span>
        );
      },
    },
    {
      id: "timeline",
      header: () => <div className="font-semibold">Timeline</div>,
      cell: ({ row }: { row: { original: ProjectSummary } }) => {
        const { startDate, endDate } = row.original;
        return (
          <div className="text-sm">
            <div>{startDate}</div>
            <div className="text-gray-300">to {endDate}</div>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      {isFetching ? (
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="space-y-2">
            <Skeleton className="h-7 w-40 rounded-md" />
            <Skeleton className="h-4 w-120 rounded-md" />
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
              {Array.from({ length: 11 }).map((_, i) => (
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
        <ErrorState  message="We couldn’t load the project status data right now. Please try again after a moment." onRetry={() => refetch()} />
      ) : (
        <div className="flex flex-col gap-6 p-4">
          <div className="mb-3">
            <h1 className="text-2xl font-bold">Project Status Report</h1>
            <p className="text-muted-foreground mt-0.5">
              Detailed performance and variance analysis. Click on a project
              name to view its full status report.
            </p>
          </div>
          {/* Project status DataTable */}
          <div className="w-full">
            <DataTableLayout
              data={projectData}
              columns={projectColumns}
              extraTools={{
                totalPages: 1,
                isLoading: isLoading,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectStatusReportPage;
