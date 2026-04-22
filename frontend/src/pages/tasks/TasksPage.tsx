import React, { useState } from "react";
import { DataTableLayout, Button, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "ikon-react-components-lib";
import { Plus, LayoutList, Clock, ArrowUpRight, ClipboardList } from "lucide-react";
import { Link } from "react-router-dom";
import { useGetProjectsQuery } from "@/features/projects/projectsApiSlice";
import { useGetTasksByProjectQuery } from "@/features/tasks/tasksApiSlice";
import AddTaskModal from "../projects/components/AddTaskModal";
import LogTimeModal from "../projects/components/LogTimeModal";

const columns = [
  {
    id: "title",
    accessorKey: "title",
    accessorFn: (row: any) => row.title,
    header: () => <div className="text-left font-semibold">Title</div>,
    cell: ({ row }: any) => <span className="font-medium">{row.original.title}</span>,
  },
  {
    id: "status",
    accessorKey: "status",
    accessorFn: (row: any) => row.status,
    header: () => <div className="text-left font-semibold">Status</div>,
    cell: ({ row }: any) => <span>{row.original.status}</span>,
  },
  {
    id: "priority",
    accessorKey: "priority",
    accessorFn: (row: any) => row.priority,
    header: () => <div className="text-left font-semibold">Priority</div>,
    cell: ({ row }: any) => <span>{row.original.priority}</span>,
  },
  {
    id: "type",
    accessorKey: "type",
    accessorFn: (row: any) => row.type,
    header: () => <div className="text-left font-semibold">Type</div>,
    cell: ({ row }: any) => <span>{row.original.type}</span>,
  },
  {
    id: "actualHours",
    accessorKey: "actualHours",
    accessorFn: (row: any) => row.actualHours,
    header: () => <div className="text-left font-semibold">Logged Hours</div>,
    cell: ({ row }: any) => <span>{row.original.actualHours} / {row.original.estimatedHours}</span>,
  },
];

export function TasksGrid({ data, onLogTime }: { data: any[]; onLogTime: (id: string) => void }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
      {data.map((task, idx) => (
        <div
          key={task.id || idx}
          className="group relative bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-primary/5"
        >
          <div className="p-5">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-primary/10 p-2 rounded-lg text-primary">
                <ClipboardList className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-2">
                <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${task.status === "done" ? "bg-green-500/10 text-green-500" :
                    task.status === "blocked" ? "bg-red-500/10 text-red-500" :
                      task.status === "in_progress" ? "bg-blue-500/10 text-blue-500" :
                        "bg-gray-500/10 text-gray-500"
                  }`}>
                  {task.status}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1">
                {task.title}
              </h3>
              <div className="flex items-center text-sm text-muted-foreground">
                <LayoutList className="w-3.5 h-3.5 mr-1.5 text-muted-foreground/70" />
                Priority: {task.priority}
              </div>
            </div>

            <div className="space-y-2 mb-5">
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="w-4 h-4 mr-2.5 text-muted-foreground/70" />
                <span className="truncate">Est: {task.estimatedHours}h | Act: {task.actualHours}h</span>
              </div>
            </div>

            <Link
              to={`/tasks/${task.id || '#'}`}
              className="flex items-center justify-center w-full py-2.5 px-4 bg-muted/30 hover:bg-muted text-foreground text-sm font-medium rounded-lg transition-colors border border-border/50"
            >
              Task Details
              <ArrowUpRight className="w-4 h-4 ml-2 opacity-50 font-bold" />
            </Link>
            <Button
              className="mt-2 w-full"
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                onLogTime(task.id);
              }}
            >
              Log Time
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

const TasksPage: React.FC = () => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [logTimeTaskId, setLogTimeTaskId] = useState<string | null>(null);

  const { data: projects = [], isLoading: isLoadingProjects } = useGetProjectsQuery();

  // Set default project when loaded
  React.useEffect(() => {
    if (!selectedProjectId && projects.length > 0) {
      setSelectedProjectId(String(projects[0].id));
    }
  }, [projects, selectedProjectId]);

  const { data: tasks = [], isLoading: isLoadingTasks, isError, refetch } = useGetTasksByProjectQuery(selectedProjectId, {
    skip: !selectedProjectId,
  });

  const [createTask, { isLoading: isCreatingTask }] = useCreateTaskMutation();

  const handleCreateTask = async (data: TaskFormValues) => {
    try {
      await createTask({
        ...data,
        projectId: selectedProjectId,
        epicId: data.epicId || null,
        sprintId: data.sprintId || null,
      }).unwrap();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to create task", error);
    }
  };

  const headerActions = (
    <Button
      onClick={() => setIsModalOpen(true)}
      className="bg-white text-black hover:bg-gray-200"
      disabled={!selectedProjectId}
    >
      <Plus className="h-4 w-4 mr-2" /> Add Task
    </Button>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-xl font-bold">Tasks</h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage your sprint tasks, backlog, and issues.
          </p>
        </div>

        <div className="flex flex-col w-[300px]">
          <span className="text-sm font-medium text-gray-400 mb-2">Select Project context</span>
          <Select
            value={selectedProjectId}
            onValueChange={setSelectedProjectId}
            disabled={isLoadingProjects || projects.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder={isLoadingProjects ? "Loading..." : "Select Project..."} />
            </SelectTrigger>
            <SelectContent>
              {projects.map((proj) => (
                <SelectItem key={proj.id} value={String(proj.id)}>
                  {proj.projectName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="w-full">
        {!selectedProjectId && !isLoadingProjects ? (
          <div className="p-8 text-center text-gray-500 bg-card rounded-md border border-dashed border-gray-700">
            Select a project above to view its tasks.
          </div>
        ) : isError ? (
          <div className="p-4 bg-red-100 text-red-700 rounded-md">
            Failed to fetch tasks for this project.
          </div>
        ) : (
          <DataTableLayout
            data={tasks}
            columns={columns}
            keyExtractor={(row: any) => row.id}
            totalPages={1}
            currentPage={1}
            actionNode={headerActions}
            isLoading={isLoadingTasks}
            onReload={refetch}
            toggleViewMode={true}
            gridComponent={(data: any[]) => <TasksGrid data={data} onLogTime={setLogTimeTaskId} />}
          />
        )}
      </div>

      {selectedProjectId && (
        <AddTaskModal
          projectId={selectedProjectId}
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {selectedProjectId && logTimeTaskId && (
        <LogTimeModal
          task={tasks.find((t) => t.id === logTimeTaskId) || null}
          open={!!logTimeTaskId}
          onClose={() => setLogTimeTaskId(null)}
        />
      )}
    </div>
  );
};

export default TasksPage;
