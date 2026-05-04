"use client";

import { useMemo } from "react";
import { Card, CardContent, DataTableLayout } from "ikon-react-components-lib";
import { Users } from "lucide-react";
import type { Task } from "@/features/tasks/tasksApiSlice";
import { getUserInfo } from "@/utils/userMap";

// ── Types ──

type MemberRow = {
  id: string;
  name: string;
  email: string;
  tasks: number;
  completed: number;
  estimatedHours: number;
  actualHours: number;
};

interface Props {
  tasks: Task[];
}

// ── Columns ──

const columns: any = [
  {
    accessorKey: "name",
    header: () => <div className="font-semibold">Team Member</div>,
    cell: ({ row }: { row: { original: MemberRow } }) => (
      <div>
        <div className="font-medium">{row.original.name}</div>
        <div className="text-xs text-gray-400">{row.original.email}</div>
      </div>
    ),
  },
  {
    accessorKey: "tasks",
    header: () => <div className="font-semibold">Tasks</div>,
    cell: ({ row }: { row: { original: MemberRow } }) => (
      <span>{row.original.tasks}</span>
    ),
  },
  {
    accessorKey: "completed",
    header: () => <div className="font-semibold">Completed</div>,
    cell: ({ row }: { row: { original: MemberRow } }) => (
      <span className="text-green-500 font-medium">{row.original.completed}</span>
    ),
  },
  {
    accessorKey: "estimatedHours",
    header: () => <div className="font-semibold">Estimated</div>,
    cell: ({ row }: { row: { original: MemberRow } }) => (
      <span>{row.original.estimatedHours}h</span>
    ),
  },
  {
    accessorKey: "actualHours",
    header: () => <div className="font-semibold">Actual</div>,
    cell: ({ row }: { row: { original: MemberRow } }) => (
      <span>{row.original.actualHours}h</span>
    ),
  },
  {
    id: "progress",
    header: () => <div className="font-semibold">Progress</div>,
    cell: ({ row }: { row: { original: MemberRow } }) => {
      const { estimatedHours, actualHours } = row.original;
      let color = "text-red-500";
      if (actualHours >= estimatedHours) color = "text-green-500";
      else if (actualHours > estimatedHours * 0.6) color = "text-yellow-500";

      return (
        <span className={`font-medium ${color}`}>
          {actualHours}h / {estimatedHours}h
        </span>
      );
    },
  },
];

// ── Component ──

export default function ResourceUtilization({ tasks }: Props) {
  const memberData = useMemo(() => {
    const byAssignee: Record<
      string,
      { tasks: number; completed: number; estimated: number; actual: number }
    > = {};

    tasks.forEach((task) => {
      const key = task.assigneeId || "unassigned";
      if (!byAssignee[key]) {
        byAssignee[key] = { tasks: 0, completed: 0, estimated: 0, actual: 0 };
      }
      byAssignee[key].tasks += 1;
      if (
        task.status?.toUpperCase() === "DONE" ||
        task.status?.toUpperCase() === "COMPLETED"
      ) {
        byAssignee[key].completed += 1;
      }
      byAssignee[key].estimated += task.estimatedHours || 0;
      byAssignee[key].actual += task.actualHours || 0;
    });

    return Object.entries(byAssignee)
      .filter(([key]) => key !== "unassigned")
      .map(([userId, data]): MemberRow => {
        const user = getUserInfo(userId);
        return {
          id: userId,
          name: user.name,
          email: user.email,
          tasks: data.tasks,
          completed: data.completed,
          estimatedHours: Math.round(data.estimated * 10) / 10,
          actualHours: Math.round(data.actual * 10) / 10,
        };
      });
  }, [tasks]);

  if (memberData.length === 0) {
    return (
      <Card className="w-full border border-dashed rounded-2xl mt-4">
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-4 flex items-center justify-center rounded-full border p-3">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-medium">No resource data available</h3>
          <p className="mt-2 text-sm max-w-md">
            Assign tasks to team members to see their utilization in this
            project.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mt-4">
      <DataTableLayout
        data={memberData}
        columns={columns}
        extraTools={{ totalPages: 1 }}
      />
    </div>
  );
}
