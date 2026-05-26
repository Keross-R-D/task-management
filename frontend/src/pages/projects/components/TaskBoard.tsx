"use client";

import { useState, useMemo } from "react";
import {
  DndContext,
  closestCenter,
  useDroppable,
  useDraggable,
  DragOverlay, //  added
} from "@dnd-kit/core";

import type { DragEndEvent } from "@dnd-kit/core";
import { Card, CardContent, Separator } from "ikon-react-components-lib";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "ikon-react-components-lib";
import {
  MoreHorizontal,
  Edit2,
  Timer,
  Trash2,
  Clock,
  Zap,
  SquareCheckBig,
  BookOpen,
  Bug,
  ListTodo,
  LoaderCircle,
  Ban,
} from "lucide-react";

import { TaskEnum } from "@/enums/task.constants";
import {
  type Task,
  useUpdateTaskStatusMutation,
  useDeleteTaskMutation,
} from "@/features/tasks/tasksApiSlice";

import AddTaskModal from "./AddTaskModal";
import LogTimeModal from "./LogTimeModal";
import { toast } from "sonner";


/* ================= HELPERS ================= */

function columnBorderColor(status: string) {
  switch (status) {
    case "blocked":
      return "border-t-red-500";
    case "in_progress":
      return "border-t-blue-500";
    case "done":
      return "border-t-green-500";
    case "todo":
    default:
      return "border-t-gray-500";
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

const COLUMN_CONFIG = [
  { key: "to_do", label: "To Do" },
  { key: "in_progress", label: "In Progress" },
  { key: "done", label: "Done" },
  { key: "blocked", label: "Blocked" },
];

const getTaskTypeIcon = (type: string) => {
  switch (type?.toUpperCase()) {

    case "TASK":
      return <SquareCheckBig className="h-4 w-4 shrink-0 items-center text-indigo-500" />;

    case "BUG":
      return <Bug className="h-4 w-4 shrink-0 items-center text-red-500" />;

    case "STORY":
      return <BookOpen className="h-4 w-4 shrink-0 items-center text-green-500" />;

    default:
      return <Zap className="h-4 w-4 shrink-0 items-center text-yellow-500" />;
  }
};

/* ================= COMPONENTS ================= */

function DraggableItem({ item, column, sprints }: any) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isLogTimeOpen, setIsLogTimeOpen] = useState(false);
  const [updateTaskStatus] = useUpdateTaskStatusMutation();
  const [deleteTask] = useDeleteTaskMutation();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging, //
  } = useDraggable({
    id: item.id,
    data: { column },
  });

  const style = isDragging
    ? { opacity: 0 } //  hide original while dragging
    : {
        transform: transform
          ? `translate(${transform.x}px, ${transform.y}px)`
          : undefined,
      };

  return (
    <>
      <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
        <Card className="mb-3 cursor-pointer border rounded-2xl shadow-sm hover:shadow-md transition py-3 m-3 bg-muted">
          <CardContent className="px-4 space-y-3">
            {/* Top Row */}
            <div className="flex items-start justify-between">
              <div className="flex items-center pl-0.5 gap-2">
                {getTaskTypeIcon(item.type)}
                <h3 className="text-sm font-semibold items-center">{item.title}</h3>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-0 border-none outline-none focus:outline-none">
                    <MoreHorizontal size={18}/>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="border rounded-lg">
                  <DropdownMenuItem
                    className="flex items-center gap-2 rounded-md hover:bg-muted w-full px-3 py-2"
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      setIsEditOpen(true);
                    }}
                  >
                    <Edit2 className="inline mr-2" /> Edit Task
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex items-center gap-2 rounded-md hover:bg-muted w-full px-3 py-2"
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      setIsLogTimeOpen(true);
                    }}
                  >
                    <Timer className="inline mr-2" /> Log Time
                  </DropdownMenuItem>
                  <Separator className="m-1"/>
                  <DropdownMenuItem
                    className="flex items-center gap-2 rounded-md hover:bg-muted w-full px-3 py-2"
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      updateTaskStatus({ id: item.id, taskStatus: "TO_DO" });
                    }}
                  >
                    <ListTodo className="h-5 w-5" /> Set To Do
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex items-center gap-2 rounded-md hover:bg-muted w-full px-3 py-2"
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      updateTaskStatus({
                        id: item.id,
                        taskStatus: "IN_PROGRESS",
                      });
                    }}
                  >
                    <LoaderCircle className="h-4 w-4" /> Set In Progress
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex items-center gap-2 rounded-md hover:bg-muted w-full px-3 py-2"
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      updateTaskStatus({ id: item.id, taskStatus: "DONE" });
                    }}
                  >
                    <SquareCheckBig className="h-4 w-4" /> Set Done
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex items-center gap-2 rounded-md hover:bg-muted w-full px-3 py-2"
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      updateTaskStatus({
                        id: item.id,
                        taskStatus: "BLOCKED",
                      });
                    }}
                  >
                    <Ban className="h-4 w-4" /> Set Blocked
                  </DropdownMenuItem>
                  <Separator className="m-1"/>
                  <DropdownMenuItem
                    className="flex items-center gap-2 rounded-md hover:bg-red-600/12! w-full px-3 py-2 text-red-500!"
                    onPointerDown={(e) => {
                      e.stopPropagation();

                      toast.warning("Delete Task ?", {
                        description:
                          "This action will permanently delete this Task.",

                        action: {
                          label: "Delete",

                          onClick: async () => {
                            try {
                              await deleteTask(item.id).unwrap();
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
                      });
                    }}
                  >
                    <Trash2 className="inline mr-2 text-red-500" /> Delete Task
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Middle Row */}
            <div className="grid gap-2">
              <div className="flex items-center gap-2 text-xs">
                <span
                  className={`${priorityColor(
                    item.priority
                  )} px-2 py-0.5 rounded-xl font-medium text-xs`}
                >
                  {item.priority?.toUpperCase()}
                </span>
              </div>

              {/* Bottom Row */}
              <div className="flex items-center gap-2 pl-1 text-xs">
                <Clock className="h-3 w-3" />
                <span>
                  {item.actualHours || 0}/{item.estimatedHours || 0}h
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {isEditOpen && (
        <AddTaskModal
          open={isEditOpen}
          task={item}
          projectId={item.projectId}
          epicId={item.epicId}
          sprintId={item.sprintId}
          sprintStartDate={sprints?.find((s) => s.id === item.sprintId)?.startDate}
          sprintEndDate={sprints?.find((s) => s.id === item.sprintId)?.endDate}
          onClose={() => setIsEditOpen(false)}
        />
      )}
      {isLogTimeOpen && (
        <LogTimeModal
          open={isLogTimeOpen}
          task={item}
          onClose={() => setIsLogTimeOpen(false)}
        />
      )}
    </>
  );
}

function Column({ id, label, items, sprints }: any) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg border border-t ${columnBorderColor(
        id
      )} w-full min-h-[400px] bg-muted-foreground px-3 pb-3`}
    >
      <div className="flex items-start px-2 pt-4 pb-2 justify-between">
        <h3 className="font-semibold mb-3">{label}</h3>
        <span className="text-sm p-1 px-2 rounded-4xl bg-muted font-semibold">
          {items.length}
        </span>
      </div>
      <hr className="mb-3" />
      <div className="max-h-95 overflow-y-auto custom-scrollbar">
        {items.map((item: Task) => (
          <DraggableItem
            key={item.id}
            item={item}
            column={id}
            sprints={sprints}
          />
        ))}
      </div>
      
    </div>
  );
}

/* ================= MAIN ================= */

export default function TaskBoard({ tasks, sprints = [] }: any) {
  const [updateTaskStatus] = useUpdateTaskStatusMutation();

  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const groupedTasks = useMemo(() => {
    const groups: any = {};
    COLUMN_CONFIG.forEach((col) => {
      groups[col.key] = [];
    });
    tasks.forEach((task: Task) => {
      const key = task.status?.toLowerCase() || "todo";
      if (groups[key]) {
        groups[key].push(task);
      } else {
        groups["todo"].push(task);
      }
    });
    return groups;
  }, [tasks]);

  const [columns, setColumns] = useState(groupedTasks);

  useMemo(() => {
    setColumns(groupedTasks);
  }, [groupedTasks]);

  const findColumn = (id: string) => {
    return Object.keys(columns).find((col) =>
      columns[col].some((item: Task) => item.id === id)
    );
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const sourceCol = findColumn(active.id as string);
    const destCol = over.id as string;

    if (!sourceCol || !destCol) return;
    if (sourceCol === destCol) return;

    const movedItem = columns[sourceCol].find(
      (i: Task) => i.id === active.id
    );
    if (!movedItem) return;

    setColumns((prev: any) => ({
      ...prev,
      [sourceCol]: prev[sourceCol].filter(
        (i: Task) => i.id !== active.id
      ),
      [destCol]: [...prev[destCol], movedItem],
    }));

    updateTaskStatus({
      id: movedItem.id,
      taskStatus: destCol.toUpperCase(),
    });
  };

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={(event) => {
        const task = tasks.find((t: Task) => t.id === event.active.id);
        setActiveTask(task || null);
      }}
      onDragEnd={(event) => {
        handleDragEnd(event);
        setActiveTask(null);
      }}
    >
      <div className="flex gap-6 overflow-x-auto">
        {COLUMN_CONFIG.map((col) => (
          <Column
            key={col.key}
            id={col.key}
            label={col.label}
            items={columns[col.key] || []}
            sprints={sprints}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <DraggableItem
            item={activeTask}
            column={activeTask.status?.toLowerCase() || "todo"}
            sprints={sprints}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}