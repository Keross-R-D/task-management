import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "ikon-react-components-lib";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "ikon-react-components-lib";
import {
  ChevronRight,
  Target,
  Plus,
  MoreHorizontal,
  LayoutDashboard,
  Pencil,
  Timer,
  Trash2,
  Play,
  History,
  X,
  Clock,
  CalendarDays,
  Zap,
  Calendar,
  CircleCheck,
  CircleX,
  SquareCheckBig,
  Bug,
  BookOpen,
} from "lucide-react";

import { TaskEnum } from "@/enums/task.constants";
import {
  useDeleteEpicMutation,
  type Epic as EpicType,
} from "@/features/epics/epicsApiSlice";
import {
  useDeleteSprintMutation,
  useUpdateSprintStatusMutation,
  type Sprint,
} from "@/features/sprints/sprintsApiSlice";
import {
  useDeleteTaskMutation,
  useUpdateTaskStatusMutation,
  useUpdateTaskMutation,
  type Task,
} from "@/features/tasks/tasksApiSlice";

// ── Helper: status badge color ──
function statusColor(status: string) {
  switch (status?.toUpperCase()) {
    case TaskEnum.Status.BLOCKED:
      return "bg-red-600/20 text-red-400";
    case TaskEnum.Status.IN_PROGRESS:
      return "bg-blue-600/20 text-blue-400";
    case TaskEnum.Status.DONE:
      return "bg-green-600/20 text-green-400";
    default:
      return "bg-gray-600/20 text-gray-400";
  }
}

function priorityColor(priority: string) {
  switch (priority?.toUpperCase()) {
    case TaskEnum.Priority.CRITICAL:
      return "bg-red-600/20 text-red-400";
    case TaskEnum.Priority.HIGH:
      return "bg-orange-600/20 text-orange-400";
    case TaskEnum.Priority.MEDIUM:
      return "bg-yellow-600/20 text-yellow-400";
    default:
      return "bg-gray-600/20 text-gray-400";
  }
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

//Apply styles in sprint header based on sprint status
const getSprintStatusStyle = (status: string) => {
  switch (status?.toUpperCase()) {

    case "PLANNED":
      return "bg-slate-500/20 border-slate-500/20";

    case "ACTIVE":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";

    case "COMPLETED":
      return "bg-green-500/10 text-green-500 border-green-500/20";

    case "CANCELLED":
      return "bg-red-500/10 text-red-500 border-red-500/20";

    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

//Apply icons based on sprint status
const getSprintStatusIcon = (status: string) => {
  switch (status?.toUpperCase()) {

    case "PLANNED":
      return <Calendar className="h-3 w-3" />;

    case "ACTIVE":
      return <Play className="h-3 w-3 fill-current" />;

    case "COMPLETED":
      return <CircleCheck className="h-3 w-3" />;

    case "CANCELLED":
      return <CircleX className="h-3 w-3" />;

    default:
      return null;
  }
};

//Apply icons based on task type
const getTaskTypeIcon = (type: string) => {
  switch (type?.toUpperCase()) {

    case "TASK":
      return <SquareCheckBig className="h-4 w-4 shrink-0 text-indigo-500" />;

    case "BUG":
      return <Bug className="h-4 w-4 shrink-0 text-red-500" />;

    case "STORY":
      return <BookOpen className="h-4 w-4 shrink-0 text-green-500" />;

    default:
      return <Zap className="h-4 w-4 shrink-0 text-yellow-500" />;
  }
};

// ── Task Row ──
function TaskRow({
  task,
  sprintStartDate,
  sprintEndDate,
}: {
  task: Task;
  sprintStartDate?: string;
  sprintEndDate?: string;
}) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isLogTimeOpen, setIsLogTimeOpen] = useState(false);
  const [isViewTimeLogsOpen, setIsViewTimeLogsOpen] = useState(false);

  const [updateTaskStatus] = useUpdateTaskStatusMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();

  const handleTaskStatus = (status: string) => {
    updateTaskStatus({ id: task.id, taskStatus: status });
  };

  const taskStatuses = [
    { value: "TO_DO", label: "Set To Do" },
    { value: "IN_PROGRESS", label: "Set In Progress" },
    { value: "DONE", label: "Set Done" },
    { value: "BLOCKED", label: "Set Blocked" },
  ];

  return (
    <>
      <div className="w-full border hover:bg-muted px-4 my-2 py-2 flex items-center justify-between rounded-lg bg-muted/30">
        {/* LEFT SIDE */}
        <div className="flex items-center gap-3">
          {getTaskTypeIcon(task.type)}
          <div className="flex flex-col gap-2">
            <h1 className="text-sm font-semibold">{task.title}</h1>
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-2">
                <span
                  className={`${statusColor(task.status)} px-2 py-[2px] rounded-md text-xs font-semibold`}
                >
                  {task.status?.toUpperCase().replace("_", " ")}
                </span>
                <span
                  className={`${priorityColor(task.priority)} px-2 py-[2px] rounded-md text-xs font-semibold`}
                >
                  {task.priority?.toUpperCase()}
                </span>
              </div>
              {task.startDate && (
                <div className="flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" />
                  <span className="text-xs">{formatDate(task.startDate)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-sm">
            <Clock className="h-4 w-4" />
            <span>
              {task.actualHours || 0}/{task.estimatedHours || 0}h
            </span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="p-0 border-none outline-none">
                <MoreHorizontal size={18} className="cursor-pointer" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border rounded-lg">
              <DropdownMenuItem
                className="rounded-md"
                onClick={() => setIsEditOpen(true)}
              >
                <Pencil className="inline mr-2" /> Edit Task
              </DropdownMenuItem>
              <DropdownMenuItem
                className="rounded-md"
                onClick={() => setIsLogTimeOpen(true)}
              >
                <Timer className="inline mr-2" /> Log Time
              </DropdownMenuItem>
              <DropdownMenuItem
                className="rounded-md"
                onClick={() => setIsViewTimeLogsOpen(true)}
              >
                <History className="inline mr-2" /> View Time Logs
              </DropdownMenuItem>
              {task.sprintId ? (
                <DropdownMenuItem
                  className="rounded-md"
                  onClick={() => updateTask({ id: task.id, sprintId: null })}
                >
                  <Play className="inline mr-2" /> Move to Backlog
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem className="rounded-md">
                  <Play className="inline mr-2" /> Move to Sprint
                </DropdownMenuItem>
              )}
              <hr className="my-1" />
              {taskStatuses
                .filter((status) => status.value !== task.status)
                .map((status) => (
                  <DropdownMenuItem
                    key={status.value}
                    onClick={() => handleTaskStatus(status.value)}
                  >
                    {status.label}
                  </DropdownMenuItem>
                ))}
              <hr className="my-1 font-bold" />
              <DropdownMenuItem
                className="flex items-center gap-2 rounded-md hover:bg-red-600/12! w-full px-3 py-2 text-red-500!"
                onClick={() =>
                  toast.warning("Delete task ?", {
                    description:
                      "This action will permanently delete this Task.",

                    action: {
                      label: "Delete",

                      onClick: async () => {
                        try {
                          await deleteTask(task.id).unwrap();
                        } catch (err) {
                          console.error("Failed to delete task", err);
                        }
                      },
                    },

                    cancel: {
                      label: "Cancel",
                      onClick: () => {},
                    },

                    className: "border border-red-500/30",

                    actionButtonStyle: {
                      backgroundColor: "#dc2626",
                      color: "white",
                    },
                  })
                }
              >
                <Trash2 className="inline mr-2 text-red-500" /> Delete Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <AddTaskModal
        open={isEditOpen}
        task={task}
        projectId={task.projectId}
        epicId={task.epicId}
        sprintId={task.sprintId}
        sprintStartDate={sprintStartDate}
        sprintEndDate={sprintEndDate}
        onClose={() => setIsEditOpen(false)}
      />
      <LogTimeModal
        open={isLogTimeOpen}
        task={task}
        onClose={() => setIsLogTimeOpen(false)}
      />
      <ViewTimeLogsModal
        open={isViewTimeLogsOpen}
        task={task}
        onClose={() => setIsViewTimeLogsOpen(false)}
        onLogMoreTime={() => setIsLogTimeOpen(true)}
      />
    </>
  );
}

import { useState, useMemo } from "react";
import AddSprintModal from "./AddSprintModal";
import AddTaskModal from "./AddTaskModal";
import AddEpicModal from "./AddEpicModal";
import LogTimeModal from "./LogTimeModal";
import ViewTimeLogsModal from "./ViewTimeLogsModal";
import { toast } from "sonner";

interface EpicComponentProps {
  epics: EpicType[];
  sprints: Sprint[];
  tasks: Task[];
  isFiltering: boolean; // ← new prop
}

type SprintStatus = "PLANNED" | "ACTIVE" | "COMPLETED" | "CANCELLED";

const sprintActions: Record<
  SprintStatus,
  {
    label: string;
    status: SprintStatus;
    icon: typeof Play;
  }[]
> = {
  PLANNED: [{ label: "Start Sprint", status: "ACTIVE", icon: Play }],

  ACTIVE: [
    { label: "Complete Sprint", status: "COMPLETED", icon: Play },
    { label: "Cancel Sprint", status: "CANCELLED", icon: X },
  ],

  COMPLETED: [
    { label: "Re-open Sprint", status: "ACTIVE", icon: Play },
    { label: "Cancel Sprint", status: "CANCELLED", icon: X },
  ],

  CANCELLED: [{ label: "Start Sprint", status: "ACTIVE", icon: Play }],
};
export default function Epic({
  epics,
  sprints,
  tasks,
  isFiltering,
}: EpicComponentProps) {
  const [addSprintEpicId, setAddSprintEpicId] = useState<string | null>(null);
  const [addTaskData, setAddTaskData] = useState<{
    sprintId: string;
    epicId: string;
    projectId: string;
  } | null>(null);
  const [editEpic, setEditEpic] = useState<EpicType | null>(null);
  const [editSprint, setEditSprint] = useState<Sprint | null>(null);

  // ── Controlled accordion state ──
  const [openEpics, setOpenEpics] = useState<string[]>([]);
  const [openSprints, setOpenSprints] = useState<string[]>([]);

  // ── IDs that have matching tasks ──
  const activeSprintIds = useMemo(
    () => new Set(tasks.map((t) => t.sprintId).filter(Boolean)),
    [tasks],
  );
  const activeEpicIds = useMemo(
    () => new Set(tasks.map((t) => t.epicId).filter(Boolean)),
    [tasks],
  );

  const derivedOpenEpics = useMemo(() => {
    if (!isFiltering) return [];
    return [...activeEpicIds].map((id) => `epic-${id}`);
  }, [activeEpicIds, isFiltering]);

  const derivedOpenSprints = useMemo(() => {
    if (!isFiltering) return [];
    return [...activeSprintIds].map((id) => `sprint-${id}`);
  }, [activeSprintIds, isFiltering]);
  const [updateSprintStatus] = useUpdateSprintStatusMutation();
  const [deleteSprint] = useDeleteSprintMutation();
  const [deleteEpic] = useDeleteEpicMutation();

  if (epics.length === 0) {
    return (
      <div className="w-full rounded-xl my-4 border px-6 py-8 text-center text-muted-foreground">
        No epics yet. Click "Add Epic" to get started.
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl my-4">
      <Accordion
        type="multiple"
        value={isFiltering ? derivedOpenEpics : openEpics}
        onValueChange={setOpenEpics} // ← user can still manually toggle
        className="w-full space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar"
      >
        {epics.map((epic) => {
          const epicSprints = sprints.filter((s) => s.epicId === epic.id);

          return (
            <div key={epic.id} className="border rounded-xl">
              <AccordionItem
                value={`epic-${epic.id}`}
                className="rounded-xl overflow-hidden group"
              >
                {/* EPIC HEADER — unchanged */}
                <AccordionTrigger className="hover:no-underline hover:bg-muted px-3 py-3 [&[data-state]>svg]:hidden">
                  <div className="flex items-center justify-between w-full min-w-0 cursor-pointer">
                    <div className="flex items-center gap-3 min-w-0">
                      <ChevronRight className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-90 shrink-0" />
                      <div className="h-8 w-8 flex items-center justify-center rounded-full border">
                        <Target className="text-[#61DAFB] text-lg" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-left truncate">
                          {epic.name}
                        </p>
                        <p className="text-sm text-gray-400 text-left truncate">
                          {epic.description || "No description"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs px-2 py-1 rounded-md border">
                        {epicSprints.length} sprint
                        {epicSprints.length !== 1 ? "s" : ""}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <div className="p-0 border-none outline-none">
                            <MoreHorizontal
                              size={18}
                              className="cursor-pointer"
                            />
                          </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="border rounded-lg"
                        >
                          <DropdownMenuItem
                            className="rounded-md cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAddSprintEpicId(epic.id);
                            }}
                          >
                            <Plus className="inline mr-2" /> Add Sprint
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="rounded-md cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditEpic(epic);
                            }}
                          >
                            <Pencil className="inline mr-2" /> Edit Epic
                          </DropdownMenuItem>
                          <hr className="border-red-800 my-1" />
                          <DropdownMenuItem
                            className="text-red-600 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();

                              toast.warning("Delete epic ?", {
                                description:
                                  "This action will permanently delete this Epic.",

                                action: {
                                  label: "Delete",

                                  onClick: async () => {
                                    try {
                                      await deleteEpic(epic.id).unwrap();
                                    } catch (err) {
                                      console.error(
                                        "Failed to delete epic",
                                        err,
                                      );
                                    }
                                  },
                                },

                                cancel: {
                                  label: "Cancel",
                                  onClick: () => {},
                                },

                                className: "border border-red-500/30",

                                actionButtonStyle: {
                                  backgroundColor: "#dc2626",
                                  color: "white",
                                },
                              });
                            }}
                          >
                            <Trash2 className="inline mr-2" /> Delete Epic
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </AccordionTrigger>
                <div className="h-px bg-border hidden group-data-[state=open]:block" />

                {/* SPRINTS — now type="multiple" and controlled */}
                <AccordionContent className="p-3 pl-8 max-h-[300px] bg-muted/30 overflow-y-auto custom-scrollbar">
                  {epicSprints.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      No sprints in this epic
                    </p>
                  ) : (
                    <Accordion
                      type="multiple" // ← was "single", now "multiple" so all matching sprints open
                      value={isFiltering ? derivedOpenSprints : openSprints}
                      onValueChange={setOpenSprints}
                      className="w-full space-y-2"
                    >
                      {epicSprints.map((sprint) => {
                        const sprintTasks = tasks.filter(
                          (t) => t.sprintId === sprint.id,
                        );

                        return (
                          <div key={sprint.id} className="border-b rounded-lg">
                            <AccordionItem
                              value={`sprint-${sprint.id}`}
                              className="border rounded-lg group/item bg-background"
                            >
                              <AccordionTrigger className="hover:no-underline hover:bg-muted rounded-b-lg px-3 py-3 [&[data-state]>svg]:hidden">
                                <div className="flex items-center justify-between w-full min-w-0 cursor-pointer">
                                  <div className="flex items-center gap-3 min-w-0 flex-wrap">
                                    <ChevronRight className="h-4 w-4 transition-transform duration-200 group-data-[state=open]/item:rotate-90 shrink-0" />
                                    <LayoutDashboard className="text-sm text-blue-400" />
                                    <span className="font-medium truncate">
                                      {sprint.name}
                                    </span>
                                    <span className={`text-xs px-2 py-1 flex justify-center items-center gap-1 rounded-full border shrink-0 ${getSprintStatusStyle(sprint.status)}`}>
                                      {getSprintStatusIcon(sprint.status)}
                                      {sprint.status}
                                    </span>
                                    <span className="text-sm truncate">
                                      ({formatDate(sprint.startDate)} -{" "}
                                      {formatDate(sprint.endDate)})
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3 shrink-0">
                                    <span className="text-sm">
                                      {sprintTasks.length} task
                                      {sprintTasks.length !== 1 ? "s" : ""}
                                    </span>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <div className="p-0 border-none outline-none">
                                          <MoreHorizontal
                                            size={18}
                                            className="cursor-pointer"
                                          />
                                        </div>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent
                                        align="end"
                                        className="border rounded-lg"
                                      >
                                        <DropdownMenuItem
                                          className="rounded-md cursor-pointer"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setAddTaskData({
                                              sprintId: sprint.id,
                                              epicId: epic.id,
                                              projectId: sprint.projectId,
                                            });
                                          }}
                                        >
                                          <Plus className="inline mr-2" /> Add
                                          Task
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          className="rounded-md cursor-pointer"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setEditSprint(sprint);
                                          }}
                                        >
                                          <Pencil className="inline mr-2" />{" "}
                                          Edit Sprint
                                        </DropdownMenuItem>
                                        <hr className="my-1" />
                                        {sprintActions[
                                          sprint.status as SprintStatus
                                        ]?.map((action) => {
                                          const Icon = action.icon;

                                          return (
                                            <DropdownMenuItem
                                              key={action.status}
                                              className="rounded-md cursor-pointer"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                updateSprintStatus({
                                                  id: sprint.id,
                                                  status: action.status,
                                                });
                                              }}
                                            >
                                              <Icon className="inline mr-2" />
                                              {action.label}
                                            </DropdownMenuItem>
                                          );
                                        })}
                                        <hr className="py-1 font-bold" />
                                        <DropdownMenuItem
                                          className="text-red-600 cursor-pointer"
                                          onClick={(e) => {
                                            e.stopPropagation();

                                            toast.warning("Delete sprint ?", {
                                              description:
                                                "This action will permanently delete this Sprint.",

                                              action: {
                                                label: "Delete",

                                                onClick: async () => {
                                                  try {
                                                    await deleteSprint(
                                                      sprint.id,
                                                    ).unwrap();
                                                  } catch (err) {
                                                    console.error(
                                                      "Failed to delete sprint",
                                                      err,
                                                    );
                                                  }
                                                },
                                              },

                                              cancel: {
                                                label: "Cancel",
                                                onClick: () => {},
                                              },

                                              className:
                                                "border border-red-500/30",

                                              actionButtonStyle: {
                                                backgroundColor: "#dc2626",
                                                color: "white",
                                              },
                                            });
                                          }}
                                        >
                                          <Trash2 className="inline mr-2" />{" "}
                                          Delete Sprint
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </div>
                              </AccordionTrigger>
                              {(isFiltering
                                ? derivedOpenSprints
                                : openSprints
                              ).includes(`sprint-${sprint.id}`) && (
                                <div className="h-px bg-border" />
                              )}
                              <AccordionContent className="p-2 pl-8 pb-0 rounded-b-lg max-h-[300px] bg-background overflow-y-auto custom-scrollbar">
                                {sprintTasks.length === 0 ? (
                                  <p className="text-sm text-muted-foreground py-4 text-center">
                                    No tasks in this sprint
                                  </p>
                                ) : (
                                  sprintTasks.map((task) => (
                                    <TaskRow
                                      key={task.id}
                                      task={task}
                                      sprintStartDate={sprint.startDate}
                                      sprintEndDate={sprint.endDate}
                                    />
                                  ))
                                )}
                              </AccordionContent>
                            </AccordionItem>
                          </div>
                        );
                      })}
                    </Accordion>
                  )}
                </AccordionContent>
              </AccordionItem>
            </div>
          );
        })}
      </Accordion>

      {/* Modals — unchanged */}
      {addSprintEpicId && (
        <AddSprintModal
          open={!!addSprintEpicId}
          onClose={() => setAddSprintEpicId(null)}
          projectId={
            epics.find((e) => e.id === addSprintEpicId)?.projectId || ""
          }
          epicId={addSprintEpicId}
          epicStartDate={epics.find((e) => e.id === addSprintEpicId)?.startDate}
          epicEndDate={epics.find((e) => e.id === addSprintEpicId)?.endDate}
        />
      )}
      {addTaskData && (
        <AddTaskModal
          open={!!addTaskData}
          onClose={() => setAddTaskData(null)}
          projectId={addTaskData.projectId}
          epicId={addTaskData.epicId}
          sprintId={addTaskData.sprintId}
          sprintStartDate={
            sprints.find((s) => s.id === addTaskData?.sprintId)?.startDate
          }
          sprintEndDate={
            sprints.find((s) => s.id === addTaskData?.sprintId)?.endDate
          }
        />
      )}
      <AddEpicModal
        open={!!editEpic}
        epic={editEpic}
        projectId={editEpic?.projectId || ""}
        onClose={() => setEditEpic(null)}
      />
      <AddSprintModal
        open={!!editSprint}
        sprint={editSprint}
        projectId={editSprint?.projectId || ""}
        epicId={editSprint?.epicId || ""}
        epicStartDate={
          epics.find((e) => e.id === editSprint?.epicId)?.startDate
        }
        epicEndDate={epics.find((e) => e.id === editSprint?.epicId)?.endDate}
        onClose={() => setEditSprint(null)}
      />
    </div>
  );
}
