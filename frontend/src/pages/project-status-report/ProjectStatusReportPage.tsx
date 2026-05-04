import { DataTableLayout, Progress } from "ikon-react-components-lib";
import React from "react";
import { useNavigate } from "react-router-dom";

type ProjectSummary = {
  id: string,
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

  const projectColumns = [
    {
      accessorKey: "projectName",
      header: () => <div className="font-semibold">Project Name</div>,
      cell: ({ row }: { row: { original: ProjectSummary } }) => (
        <div className="font-medium cursor-pointer"
            onClick={() => navigate(`/main/project-status-report/${row.original.id}`)}>{row.original.projectName}</div>
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
              <Progress value={value} />
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

  const projectData: ProjectSummary[] = [
    {
      id: "1",
      projectName: "Project 1",
      status: "NOT_STARTED",
      progress: 100,
      tasksDone: 2,
      tasksTotal: 2,
      estimatedHours: 87,
      actualHours: 0,
      variance: 87,
      startDate: "Feb 2, 2026",
      endDate: "Dec 31, 2026",
    },
    {
      id: "2",
      projectName: "Project 2",
      status: "NOT_STARTED",
      progress: 0,
      tasksDone: 0,
      tasksTotal: 2,
      estimatedHours: 16,
      actualHours: 0,
      variance: 16,
      startDate: "Dec 12, 2026",
      endDate: "Dec 12, 2027",
    },
    {
      id: "3",
      projectName: "Project 3",
      status: "NOT_STARTED",
      progress: 0,
      tasksDone: 0,
      tasksTotal: 0,
      estimatedHours: 0,
      actualHours: 0,
      variance: 0,
      startDate: "Jul 25, 2008",
      endDate: "Sep 6, 1990",
    },
    {
      id: "4",
      projectName: "Project 4",
      status: "NOT_STARTED",
      progress: 0,
      tasksDone: 0,
      tasksTotal: 0,
      estimatedHours: 0,
      actualHours: 0,
      variance: 0,
      startDate: "Oct 31, 2023",
      endDate: "Jan 7, 1995",
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-4">
        <div className="mb-3">
          <h1 className="text-2xl font-bold">Project Status Report</h1>
          <p className="text-muted-foreground">Detailed performance and variance analysis. Click on a project name to view its full status report.</p>
        </div>
        {/* Project status DataTable */}
        <div className="w-full">
          <DataTableLayout 
            data={projectData}
            columns={projectColumns}
            extraTools={{
              totalPages: 1
            }} 
          />
        </div>
    </div>
  );
};

export default ProjectStatusReportPage;
