"use client";

import { useState, useMemo } from "react";
import {
  DndContext,
  closestCenter,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";

import type { DragEndEvent } from "@dnd-kit/core";
import { Card, CardContent } from "ikon-react-components-lib";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "ikon-react-components-lib";
import {
  MoreHorizontal,
  Edit2,
  Pencil,
  Timer,
  Trash2,
  CheckSquare,
  Clock,
  CalendarDays,
} from "lucide-react";

import type { Task } from "@/features/tasks/tasksApiSlice";

import AddTaskModal from "./AddTaskModal";
import LogTimeModal from "./LogTimeModal";

/* ================= TYPES ================= */

type DraggableItemProps = {
  item: Task;
  column: string;
};

type ColumnProps = {
  id: string;
  label: string;
  items: Task[];
};

/* ================= HELPERS ================= */

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

const COLUMN_CONFIG = [
  { key: "todo", label: "To Do" },
  { key: "in_progress", label: "In Progress" },
  { key: "done", label: "Done" },
  { key: "blocked", label: "Blocked" },
];

/* ================= COMPONENTS ================= */

function DraggableItem({ item, column }: DraggableItemProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isLogTimeOpen, setIsLogTimeOpen] = useState(false);

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: item.id,
    data: { column },
  });

  const style = {
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined,
  };

  return (
    <>
      <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
        <Card className="mb-3 cursor-pointer border rounded-2xl shadow-sm hover:shadow-md transition py-2 m-4">
          <CardContent className="space-y-3">
            {/* Top Row */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4" />
                <h3 className="text-sm font-semibold">{item.title}</h3>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-0 border-none outline-none focus:outline-none">
                    <MoreHorizontal size={18} className="cursor-pointer" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="border rounded-lg">
                  <DropdownMenuItem
                    className="rounded-md cursor-pointer"
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      setIsEditOpen(true);
                    }}
                  >
                    <Edit2 className="inline mr-2" /> Edit Task
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="rounded-md cursor-pointer"
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      setIsLogTimeOpen(true);
                    }}
                  >
                    <Timer className="inline mr-2" /> Log Time
                  </DropdownMenuItem>
                  <hr className="py-1 font-bold" />
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <Trash2 className="inline mr-2" /> Delete Task
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Middle Row */}
            <div className="grid gap-2">
              <div className="flex items-center gap-2 text-xs">
                <span
                  className={`${priorityColor(item.priority)} px-2 py-0.5 rounded-xl font-medium text-xs`}
                >
                  {item.priority?.toUpperCase()}
                </span>
              </div>

              {/* Bottom Row */}
              <div className="flex items-center gap-2 text-xs">
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

function Column({ id, label, items }: ColumnProps) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div ref={setNodeRef} className="rounded-xl border w-full min-h-[400px]">
      <div className="flex items-start px-4 pt-4 pb-2 justify-between">
        <h3 className="font-semibold mb-3">{label}</h3>
        <span className="text-xs">
          {items.length} task{items.length !== 1 ? "s" : ""}
        </span>
      </div>
      <hr className="mb-3" />
      {items.map((item) => (
        <DraggableItem key={item.id} item={item} column={id} />
      ))}
    </div>
  );
}

/* ================= MAIN ================= */

interface TaskBoardProps {
  tasks: Task[];
}

export default function TaskBoard({ tasks }: TaskBoardProps) {
  // Group tasks by status
  const groupedTasks = useMemo(() => {
    const groups: Record<string, Task[]> = {};
    COLUMN_CONFIG.forEach((col) => {
      groups[col.key] = [];
    });
    tasks.forEach((task) => {
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

  // Re-sync when tasks change
  useMemo(() => {
    setColumns(groupedTasks);
  }, [groupedTasks]);

  const findColumn = (id: string): string | undefined => {
    return Object.keys(columns).find((col) =>
      columns[col].some((item) => item.id === id),
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const sourceCol = findColumn(active.id as string);
    const destCol = over.id as string;

    if (!sourceCol || !destCol) return;
    if (sourceCol === destCol) return;

    const movedItem = columns[sourceCol].find((i) => i.id === active.id);
    if (!movedItem) return;

    setColumns((prev) => ({
      ...prev,
      [sourceCol]: prev[sourceCol].filter((i) => i.id !== active.id),
      [destCol]: [...prev[destCol], movedItem],
    }));

    // TODO: Call updateTask mutation to persist status change
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex gap-6 overflow-x-auto">
        {COLUMN_CONFIG.map((col) => (
          <Column
            key={col.key}
            id={col.key}
            label={col.label}
            items={columns[col.key] || []}
          />
        ))}
      </div>
    </DndContext>
  );
}
