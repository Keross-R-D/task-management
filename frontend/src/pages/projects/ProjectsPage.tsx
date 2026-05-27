import React, { useState, useMemo } from "react";
import {
  DataTableLayout,
  Button,
  Card,
  Skeleton,
} from "ikon-react-components-lib";
import {
  Plus,
  Users,
  ClipboardCheck,
  ArrowUpRight,
  FolderOpen,
  CalendarDays,
  User,
  Calendar,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { appPath } from "@/utils/basePath";
import {
  useGetProjectsQuery,
  useCreateProjectMutation,
} from "@/features/projects/projectsApiSlice";
import AddProjectModal, {
  type ProjectFormValues,
} from "./components/AddProjectModal";
import ErrorState from "@/components/ErrorState";
import { useUserMap } from "@/utils/userMap";

//Applying style based on project status
const getProjectStatusStyles = (status: string) => {
  switch (status) {
    case "PLANNED":
      return "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20";

    case "IN_PROGRESS":
      return "bg-blue-500/10 text-blue-500 border border-blue-500/20";

    case "COMPLETED":
      return "bg-green-500/10 text-green-500 border border-green-500/20";

    case "ON_HOLD":
      return "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20";

    default:
      return "bg-muted text-muted-foreground border border-border";
  }
};

//Apply border styles based on status
const getBorderStyles = (status: string) => {
  switch (status) {
    case "PLANNED":
      return "border-t-indigo-500";

    case "IN_PROGRESS":
      return "border-t-blue-500";

    case "COMPLETED":
      return "border-t-green-500";

    case "ON_HOLD":
      return "border-t-yellow-500";

    default:
      return "border-t-indigo-500";
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

export function ProjectsGrid({ data }: { data: any[] }) {
  const navigate = useNavigate();
  const { getUserInfo } = useUserMap();
  
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-4">
      {data.map((project, idx) => (
        <div
          key={project.id || idx}
          onClick={() => navigate(appPath(`/projects/${project.id}`))}
          className={`group relative bg-card border ${getBorderStyles(project.projectStatus)} rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-primary/5 cursor-pointer`}
        >
          <div className="p-5">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-primary/10 p-2 rounded-lg text-primary">
                <FolderOpen className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`px-2 py-1 rounded-md text-xs font-semibold w-fit ${getProjectStatusStyles(project.projectStatus)}`}
                >
                  {project.projectStatus.replace("_", " ")}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1">
                {project.projectName}
              </h3>
              <div className="flex items-center text-sm text-muted-foreground">
                <ClipboardCheck className="w-3.5 h-3.5 mr-1.5 text-muted-foreground/70" />
                {project.type || "General Type"}
              </div>
            </div>

            <div className="space-y-2 mb-5">
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="w-4 h-4 mr-2.5" />
                <span className="truncate">
                  <span className="pr-0.5">Client:</span> <span className="text-muted-foreground/70 font-bold">{project.clientName || "No client"}</span>
                </span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <User className="w-4 h-4 mr-2.5 text-muted-foreground/70" />
                <span className="truncate">
                  <span className="pr-0.5">Manager:</span> <span className="text-muted-foreground/70 font-bold">{getUserInfo(project.managerId).name || "Unassigned"}</span>
                </span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <span className="w-4 h-4 mr-2.5 flex items-center justify-center font-bold text-[10px] text-muted-foreground/70">
                  <Calendar />
                </span>
                <span className="font-semibold">{formatDate(project.startDate)} - {formatDate(project.endDate)}</span>
              </div>
            </div>

            <div className="flex items-center justify-center w-full py-2.5 px-4 bg-muted/30 hover:bg-muted text-foreground text-sm font-medium rounded-lg transition-colors border border-border/70">
              View Details
              <ArrowUpRight className="w-4 h-4 ml-2 opacity-50 font-bold" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const { getUserInfo } = useUserMap();

  const columns = useMemo(
    () => [
      {
        accessorKey: "projectName",
        header: () => (
          <div className="text-left font-semibold ">Project Name</div>
        ),
        cell: ({ row }: any) => (
          <span
            className="font-medium cursor-pointer hover:underline"
            onClick={() => navigate(appPath(`/projects/${row.original.id}`))}
          >
            {row.original.projectName}
          </span>
        ),
      },

      {
        accessorKey: "clientName",
        header: () => (
          <div className="text-left font-semibold">Client Name</div>
        ),
        cell: ({ row }: any) => <span>{row.original.clientName}</span>,
      },

      {
        accessorKey: "managerName",
        header: () => (
          <div className="text-left font-semibold">Manager Name</div>
        ),
        cell: ({ row }: any) => (
          <span className="flex gap-1 items-center font-semibold bg-muted w-fit rounded-md px-1.5 py-1">
            {getUserInfo(row.original.managerId).name ||"Unassigned"}
          </span>
        ),
      },

      {
        accessorKey: "projectStatus",
        header: () => <div className="text-left font-semibold">Status</div>,
        cell: ({ row }: any) => (
          <span
            className={`px-2 py-1 rounded-md text-xs font-semibold w-fit ${getProjectStatusStyles(row.original.projectStatus)}`}
          >
            {row.original.projectStatus.replace("_", " ")}
          </span>
        ),
      },

      {
        accessorKey: "startDate",
        header: () => <div className="text-left font-semibold">Start Date</div>,
        cell: ({ row }: any) => <span>{row.original.startDate}</span>,
      },

      {
        accessorKey: "endDate",
        header: () => <div className="text-left font-semibold">End Date</div>,
        cell: ({ row }: any) => <span>{row.original.endDate}</span>,
      },
    ],
    [navigate, getUserInfo],
  );
  const {
    data: projects = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetProjectsQuery();
  const [createProject, { isLoading: isCreating }] = useCreateProjectMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatLocalDate = (date: Date) => {
    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const handleCreateProject = async (data: ProjectFormValues) => {
    try {
      await createProject({
        ...data,
        startDate: formatLocalDate(data.startDate),
        endDate: formatLocalDate(data.endDate),
        managerId: data.managerId,
        managerDelegateId: data.managerDelegateId,
        teamMemberIds: data.teamMemberIds,
      }).unwrap();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to create project", error);
    }
  };

  const headerActions = (
    <Button
      onClick={() => setIsModalOpen(true)}
      className="bg-white text-black hover:bg-gray-200"
    >
      <Plus className="h-4 w-4 mr-2" /> Add Project
    </Button>
  );

  return (
    <>
      {isFetching ? (
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="space-y-2">
            <Skeleton className="h-7 w-40 rounded-md" />
            <Skeleton className="h-4 w-52 rounded-md" />
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
        <ErrorState
          message="We couldn’t load the projects data right now. Please try again after a moment."
          onRetry={() => refetch()}
        />
      ) : (
        <div className="flex flex-col gap-6 p-4">
          <div>
            <h1 className="text-2xl font-bold">Projects</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {projects.length} of {projects.length} projects
            </p>
          </div>

          <div className="w-full">
            <DataTableLayout
              data={projects}
              columns={columns as any}
              // keyExtractor={(row: any) => row.id}
              extraTools={{
                totalPages: 1,
                // currentPage: 1,
                actionNode: headerActions,
                isLoading: isLoading,
                onReload: refetch,
                toggleViewMode: true,
                // onRowClick: (row: any) => navigate(`/projects/${row.id}`),
                gridComponent: (data: any[]) => <ProjectsGrid data={data} />,
              }}
            />
          </div>

          <AddProjectModal
            open={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleCreateProject}
            isLoading={isCreating}
          />
        </div>
      )}
    </>
  );
};

export default ProjectsPage;
