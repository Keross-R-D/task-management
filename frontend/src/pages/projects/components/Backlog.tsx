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
  Zap,
  Clock,
  LayoutDashboard,
  Pencil,
  Trash2,
  Play,
  History,
  Timer,
  ChevronRight,
  MoreHorizontal,
  CalendarDays,
} from "lucide-react";

import type { Task } from "@/features/tasks/tasksApiSlice";

// ── Helper: status badge color ──
function statusColor(status: string) {
  switch (status?.toUpperCase()) {
    case "BLOCKED":
      return "bg-red-600/20 text-red-400";
    case "IN_PROGRESS":
      return "bg-blue-600/20 text-blue-400";
    case "DONE":
      return "bg-green-600/20 text-green-400";
    default:
      return "bg-gray-600/20 text-gray-400";
  }
}

function priorityColor(priority: string) {
  switch (priority?.toUpperCase()) {
    case "CRITICAL":
      return "bg-red-600/20 text-red-400";
    case "HIGH":
      return "bg-orange-600/20 text-orange-400";
    case "MEDIUM":
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

import { useState } from "react";
import AddTaskModal from "./AddTaskModal";
import LogTimeModal from "./LogTimeModal";

interface BacklogProps {
  tasks: Task[];
}

function BacklogTaskRow({ task }: { task: Task }) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isLogTimeOpen, setIsLogTimeOpen] = useState(false);

  return (
    <>
      <div className="px-6 py-4 flex items-center justify-between w-full">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Zap className="text-yellow-400 h-4 w-4" />
            <span className="font-semibold text-sm">
              {task.title}
            </span>
          </div>

          {/* Status Badges */}
          <div className="flex items-center gap-2 ml-4">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(task.status)}`}
            >
              {task.status?.toUpperCase()}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${priorityColor(task.priority)}`}
            >
              {task.priority?.toUpperCase()}
            </span>
          </div>

          {task.startDate && (
            <div className="flex items-center gap-1 text-sm">
              <CalendarDays className="h-3 w-3" />
              <span className="text-xs">
                {formatDate(task.startDate)}
              </span>
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="group flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span className="font-medium text-sm">
            {task.actualHours || 0}/{task.estimatedHours || 0}h
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
              <DropdownMenuItem className="rounded-md cursor-pointer" onClick={() => setIsEditOpen(true)}>
                <Pencil className="inline mr-2" /> Edit Task
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-md cursor-pointer" onClick={() => setIsLogTimeOpen(true)}>
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
      <AddTaskModal open={isEditOpen} task={task} projectId={task.projectId} epicId={task.epicId} sprintId={task.sprintId} onClose={() => setIsEditOpen(false)} />
      <LogTimeModal open={isLogTimeOpen} task={task} onClose={() => setIsLogTimeOpen(false)} />
    </>
  );
}

export default function Backlog({ tasks }: BacklogProps) {
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const projectId = tasks.length > 0 ? tasks[0].projectId : "";

  return (
    <div className="w-full rounded-xl">
      <Accordion type="single" collapsible className="w-full">
        <div className="border rounded-xl">
          <AccordionItem
            value="backlog"
            className="rounded-xl overflow-hidden group"
          >
            {/* BACKLOG HEADER */}
            <AccordionTrigger className=" hover:no-underline hover:bg-[#272b2f]/50 px-3 py-3 [&[data-state]>svg]:hidden">
              <div className="flex items-center justify-between w-full min-w-0 cursor-pointer">
                {/* LEFT */}
                <div className="flex items-center gap-3 min-w-0">
                  <ChevronRight className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-90 shrink-0" />
                  <div className="h-8 w-8 flex items-center justify-center rounded-full border">
                    <LayoutDashboard className="text-[#61DAFB] h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold truncate">Backlog</p>
                    <p className="text-sm text-muted-foreground truncate">
                      Unassigned tasks
                    </p>
                  </div>
                </div>

                {/* RIGHT */}
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs">
                    {tasks.length} task{tasks.length !== 1 ? "s" : ""}
                  </span>
                  <div 
                    className="px-2 py-1 rounded-md border text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsAddTaskOpen(true);
                    }}
                  >
                    + Add Task
                  </div>
                </div>
              </div>
            </AccordionTrigger>
            <div className="h-px bg-border hidden group-data-[state=open]:block" />


            {/* BACKLOG CONTENT */}
            <AccordionContent className="px-2 py-2 max-h-[300px] overflow-y-auto scrollbar-thin">
              {tasks.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No backlog tasks
                </p>
              ) : (
                tasks.map((task) => (
                  <BacklogTaskRow key={task.id} task={task} />
                ))
              )}
            </AccordionContent>
          </AccordionItem>
        </div>
      </Accordion>

      <AddTaskModal 
        open={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        projectId={projectId}
        epicId={null}
        sprintId={null}
      />
    </div>
  );
}
