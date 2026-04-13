import React, { useState } from "react";
import { DataTable, Button, DataTableLayout } from "ikon-react-components-lib";
import { Plus } from "lucide-react";
import {
  useGetProjectsQuery,
  useCreateProjectMutation,
} from "@/features/projects/projectsApiSlice";
import AddProjectModal, {
  type ProjectFormValues,
} from "./components/AddProjectModal";
import { useNavigate } from "react-router-dom";



const ProjectsPage: React.FC = () => {
  const { data: projects = [], isLoading, isError } = useGetProjectsQuery();
  const [createProject, { isLoading: isCreating }] = useCreateProjectMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();


  const columns = [
  {
    accessorKey: "projectName",
    header: () => <div className="text-left font-semibold">Project Name</div>,
    cell: ({ row }: any) => (
      <span className="font-medium" onClick={() => navigate(`/main/projects/${row.original.id}`)}>
        {row.original.projectName}
      </span>
    ),
  },
  {
    accessorKey: "clientName",
    header: () => <div className="text-left font-semibold">Client Name</div>,
    cell: ({ row }: any) => <span>{row.original.clientName}</span>,
  },
  {
    accessorKey: "projectStatus",
    header: () => <div className="text-left font-semibold">Status</div>,
    cell: ({ row }: any) => <span>{row.original.projectStatus}</span>,
  },
  {
    accessorKey: "startDate",
    header: () => <div className="text-left font-semibold">Start Date</div>,
    cell: ({ row }: any) => <span>{row.original.startDate}</span>,
  },
];

const ProjectsPage: React.FC = () => {
  const { data: projects = [], isLoading, isError } = useGetProjectsQuery();
  const [createProject, { isLoading: isCreating }] = useCreateProjectMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateProject = async (data: ProjectFormValues) => {
    try {
      await createProject({
        ...data,
        managerId: data.managerId || "00000000-0000-0000-0000-000000000000",
        teamMemberIds: [],
      }).unwrap();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to create project", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center flex-col items-center h-[250px] gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-[#635bff]" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-md">
        Failed to fetch projects. Please try again.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Projects</h1>
          <p className="text-sm text-gray-400 mt-1">
            {projects.length} of {projects.length} projects
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-white text-black hover:bg-gray-200"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Project
        </Button>
      </div>

      <div className="w-full">
        <DataTableLayout columns={columns} data={projects} totalPages={1} />
      </div>

      <AddProjectModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateProject}
        isLoading={isCreating}
      />
    </div>
  );
}
};

export default ProjectsPage;
