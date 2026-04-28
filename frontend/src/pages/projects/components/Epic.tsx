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
} from "lucide-react";

import type { Epic as EpicType } from "@/features/epics/epicsApiSlice";
import type { Sprint } from "@/features/sprints/sprintsApiSlice";
import type { Task } from "@/features/tasks/tasksApiSlice";
import { TaskEnum } from "@/enums/task.constants";

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
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ── Task Row ──
function TaskRow({ task }: { task: Task }) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isLogTimeOpen, setIsLogTimeOpen] = useState(false);

  return (
    <>
      <div className="w-full border hover:bg-[#272b2f]/50 px-6 my-2 py-2 flex items-center justify-between rounded-md">
        {/* LEFT SIDE */}
        <div className="flex items-center gap-3">
          <Zap className="text-yellow-400 h-4 w-4 shrink-0" />
          <div className="flex flex-col gap-2">
            <h1 className="text-sm font-semibold">{task.title}</h1>
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-2">
                <span
                  className={`${statusColor(task.status)} px-2 py-[2px] rounded-md text-xs font-semibold`}
                >
                  {task.status?.toUpperCase()}
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
                className="rounded-md cursor-pointer"
                onClick={() => setIsEditOpen(true)}
              >
                <Pencil className="inline mr-2" /> Edit Task
              </DropdownMenuItem>
              <DropdownMenuItem
                className="rounded-md cursor-pointer"
                onClick={() => setIsLogTimeOpen(true)}
              >
                <Timer className="inline mr-2" /> Log Time
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-md">
                <History className="inline mr-2" /> View Time Logs
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-md">
                <Play className="inline mr-2" /> Move to Sprint
              </DropdownMenuItem>
              <hr className="py-1 font-bold" />
              <DropdownMenuItem>
                <Trash2 className="inline mr-2" /> Delete Task
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
        onClose={() => setIsEditOpen(false)}
      />

      <LogTimeModal
        open={isLogTimeOpen}
        task={task}
        onClose={() => setIsLogTimeOpen(false)}
      />
    </>
  );
}

import { useState, useMemo } from "react";
import AddSprintModal from "./AddSprintModal";
import AddTaskModal from "./AddTaskModal";
import AddEpicModal from "./AddEpicModal";
import LogTimeModal from "./LogTimeModal";

interface EpicComponentProps {
  epics: EpicType[];
  sprints: Sprint[];
  tasks: Task[];
  isFiltering: boolean; // ← new prop
}

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
        className="w-full space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin"
      >
        {epics.map((epic) => {
          const epicSprints = sprints.filter((s) => s.epicId === epic.id);

          return (
            <div key={epic.id} className="border rounded-xl">
              <AccordionItem
                value={`epic-${epic.id}`}
                className="rounded-xl overflow-hidden"
              >
                {/* EPIC HEADER — unchanged */}
                <AccordionTrigger className="group hover:no-underline hover:bg-[#272b2f]/50 px-3 py-3 [&[data-state]>svg]:hidden">
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
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="inline mr-2" /> Delete Epic
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </AccordionTrigger>
                <hr className="border" />

                {/* SPRINTS — now type="multiple" and controlled */}
                <AccordionContent className="px-3 py-2 max-h-[300px] overflow-y-auto scrollbar-thin">
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
                          <div key={sprint.id} className="border rounded-xl">
                            <AccordionItem
                              value={`sprint-${sprint.id}`}
                              className="border rounded-lg"
                            >
                              <AccordionTrigger className="group hover:no-underline hover:bg-[#272b2f]/50 px-3 py-3 [&[data-state]>svg]:hidden">
                                <div className="flex items-center justify-between w-full min-w-0 cursor-pointer">
                                  <div className="flex items-center gap-3 min-w-0 flex-wrap">
                                    <ChevronRight className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-90 shrink-0" />
                                    <LayoutDashboard className="text-sm text-blue-400" />
                                    <span className="font-medium truncate">
                                      {sprint.name}
                                    </span>
                                    <span className="text-xs px-2 py-1 rounded-md border shrink-0">
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
                                        <DropdownMenuItem
                                          className="rounded-md cursor-pointer"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <Play className="inline mr-2" /> Start
                                          Sprint
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          className="rounded-md cursor-pointer"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <X className="inline mr-2" /> Cancel
                                          Sprint
                                        </DropdownMenuItem>
                                        <hr className="py-1 font-bold" />
                                        <DropdownMenuItem
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <Trash2 className="inline mr-2" />{" "}
                                          Delete Sprint
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </div>
                              </AccordionTrigger>
                              <hr />
                              <AccordionContent className="px-3 pb-0 max-h-[300px] overflow-y-auto scrollbar-thin">
                                {sprintTasks.length === 0 ? (
                                  <p className="text-sm text-muted-foreground py-4 text-center">
                                    No tasks in this sprint
                                  </p>
                                ) : (
                                  sprintTasks.map((task) => (
                                    <TaskRow key={task.id} task={task} />
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
        />
      )}
      {addTaskData && (
        <AddTaskModal
          open={!!addTaskData}
          onClose={() => setAddTaskData(null)}
          projectId={addTaskData.projectId}
          epicId={addTaskData.epicId}
          sprintId={addTaskData.sprintId}
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
        onClose={() => setEditSprint(null)}
      />
    </div>
  );
}
