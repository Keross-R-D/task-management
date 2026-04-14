"use client";

import { useState } from "react";
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
import { MoreHorizontal } from "lucide-react";
import { MdOutlineEdit, MdOutlineTimer } from "react-icons/md";
import { RiDeleteBinLine } from "react-icons/ri";
import { FaRegCheckSquare } from "react-icons/fa";
import { FiClock } from "react-icons/fi";

/* ================= TYPES ================= */

type Task = {
  id: string;
  title: string;
};

type ColumnType = {
  [key: string]: Task[];
};

type DraggableItemProps = {
  item: Task;
  column: string;
};

type ColumnProps = {
  id: string;
  items: Task[];
};

/* ================= DATA ================= */

const initialData: ColumnType = {
  todo: [
    { id: "1", title: "Setup project" },
    { id: "2", title: "Design UI" },
  ],
  inProgress: [{ id: "3", title: "Develop features" }],
  done: [{ id: "4", title: "Deploy app" }],
  Blocked: [{ id: "5", title: "Deploy app" }],
};

/* ================= COMPONENTS ================= */

function DraggableItem({ item, column }: DraggableItemProps) {
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
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <Card className="mb-3 cursor-pointer border rounded-2xl shadow-sm hover:shadow-md transition py-2 m-4">
        <CardContent className="space-y-3">
          {/* Top Row */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <FaRegCheckSquare className="text-sm" />
              <h3 className="text-sm font-semibold">{item.title}</h3>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-0 border-none outline-none">
                  <MoreHorizontal size={18} className="cursor-pointer" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="border rounded-lg">
                <DropdownMenuItem className="rounded-md">
                  <MdOutlineEdit className="inline mr-2" />
                  Edit Task
                </DropdownMenuItem>

                <DropdownMenuItem className="rounded-md">
                  <MdOutlineTimer className="inline mr-2" />
                  Log Time
                </DropdownMenuItem>

                <hr className="py-1 font-bold" />
                <DropdownMenuItem>
                  <RiDeleteBinLine className="inline mr-2" />
                  Delete Epic
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Middle Row */}
          <div className="grid gap-2">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-yellow-400 border px-2 py-0.5 rounded-xl font-medium text-xs">
                MEDIUM
              </span>
              <span>epic1 → sprint1</span>
            </div>

            {/* Bottom Row */}
            <div className="flex items-center gap-2 text-xs">
              <FiClock />
              <span>0/0h</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Column({ id, items }: ColumnProps) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className="rounded-xl border w-full min-h-[400px]"
    >
      <div className="flex items-start px-4 pt-4 pb-2 justify-between">
        <h3 className="font-semibold mb-3 capitalize">{id}</h3>
        <span className="text-xs">{items.length} tasks</span>
      </div>
      <hr className="mb-3" />
      {items.map((item) => (
        <DraggableItem key={item.id} item={item} column={id} />
      ))}
    </div>
  );
}

/* ================= MAIN ================= */

export default function TaskBoard() {
  const [columns, setColumns] = useState<ColumnType>(initialData);

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
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex gap-6  overflow-x-auto">
        {Object.entries(columns).map(([colId, items]) => (
          <Column key={colId} id={colId} items={items} />
        ))}
      </div>
    </DndContext>
  );
}
