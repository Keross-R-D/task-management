// "use client";

import { useMemo, useRef, useEffect } from "react";
import React, { useState } from "react";

import type { Task } from "@/features/tasks/tasksApiSlice";
import type { Epic } from "@/features/epics/epicsApiSlice"; // adjust import path as needed
import { useUserMap } from "@/utils/userMap";

import {
  Users,
  TrendingUp,
  Search,
  CalendarDays,
  User,
  X,
  ChevronDown,
} from "lucide-react";

// ── Card primitives ──

const Card = ({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => (
  <div
    className={`rounded-xl border border-border bg-card text-card-foreground shadow-sm ${className}`}
  >
    {children}
  </div>
);

const CardContent = ({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => <div className={`p-6 ${className}`}>{children}</div>;

// ── Types ──

interface Props {
  tasks: Task[];
  epics: Epic[]; // each epic has at minimum: id, name, estimatedHours (or similar)
}

// Derived shape we build per-assignee for the table
interface ResourceRow {
  userId: string;
  userName: string;
  totalTasks: number;
  doneTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  blockedTasks: number;
  estimatedHours: number; // sum of task estimatedHours  →  "Assigned"
  actualHours: number; // sum of task actualHours     →  "Actual"
  utilizationPercentage: number;
  epicBreakdown: {
    epicId: string;
    epicName: string;
    totalTasks: number;
    doneTasks: number;
  }[];
}

// Status normalisation
const isDone = (s?: string) =>
  ["DONE", "COMPLETED"].includes(s?.toUpperCase() ?? "");
const isInProgress = (s?: string) =>
  ["IN_PROGRESS", "INPROGRESS", "ACTIVE", "IN PROGRESS"].includes(
    s?.toUpperCase() ?? "",
  );
const isBlocked = (s?: string) => s?.toUpperCase() === "BLOCKED";
const isTodo = (s?: string) =>
  ["TODO", "TO_DO", "TO DO", "OPEN", "BACKLOG"].includes(
    s?.toUpperCase() ?? "",
  );

// ── AssigneeDropdown ──

interface AssigneeOption {
  userId: string;
  userName: string;
}

interface AssigneeDropdownProps {
  options: AssigneeOption[];
  selected: string[];
  onChange: (ids: string[]) => void;
}

function AssigneeDropdown({
  options,
  selected,
  onChange,
}: AssigneeDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (id: string) =>
    onChange(
      selected.includes(id)
        ? selected.filter((s) => s !== id)
        : [...selected, id],
    );

  const removeChip = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onChange(selected.filter((s) => s !== id));
  };

  const triggerLabel =
    selected.length === 0
      ? "All assignees"
      : selected.length === 1
        ? (options.find((o) => o.userId === selected[0])?.userName ??
          "1 selected")
        : `${selected.length} assignees`;

  return (
    <div className="relative w-[240px]" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 h-9 w-full pl-3 pr-2.5 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring hover:bg-secondary/40 transition-colors"
      >
        <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />

        {selected.length > 0 ? (
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <div className="flex -space-x-1.5 shrink-0">
              {selected.slice(0, 3).map((id) => {
                const opt = options.find((o) => o.userId === id);
                return (
                  <div
                    key={id}
                    className="h-5 w-5 rounded-full bg-primary/10 text-primary border-2 border-background flex items-center justify-center text-[9px] font-bold"
                  >
                    {opt?.userName.charAt(0).toUpperCase()}
                  </div>
                );
              })}
            </div>
            <span className="truncate text-foreground text-sm">
              {triggerLabel}
            </span>
          </div>
        ) : (
          <span className="flex-1 text-left text-muted-foreground text-sm truncate">
            {triggerLabel}
          </span>
        )}

        <ChevronDown
          className={`h-3.5 w-3.5 text-muted-foreground shrink-0 transition-transform duration-150 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute z-50 top-[calc(100%+4px)] left-0 w-full rounded-md border border-border bg-card shadow-lg overflow-hidden">
          {selected.length > 0 && (
            <div className="flex flex-wrap gap-1.5 p-2 border-b border-border/60">
              {selected.map((id) => {
                const opt = options.find((o) => o.userId === id);
                return (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1 text-xs pl-1.5 pr-1 py-0.5 rounded-full bg-primary/10 text-primary font-medium"
                  >
                    <span className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center text-[9px] font-bold shrink-0">
                      {opt?.userName.charAt(0).toUpperCase()}
                    </span>
                    {opt?.userName.split(" ")[0]}
                    <button
                      onClick={(e) => removeChip(e, id)}
                      className="ml-0.5 hover:opacity-60 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          <ul className="py-1 max-h-52 overflow-y-auto">
            {options.map((opt) => {
              const isSelected = selected.includes(opt.userId);
              return (
                <li key={opt.userId}>
                  <button
                    type="button"
                    onClick={() => toggle(opt.userId)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-left transition-colors hover:bg-secondary/50 ${
                      isSelected ? "bg-secondary/30" : ""
                    }`}
                  >
                    <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                      {opt.userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate leading-tight">
                        {opt.userName}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                          <path
                            d="M1 3L3 5L7 1"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          {selected.length > 0 && (
            <div className="border-t border-border/60 p-2">
              <button
                type="button"
                onClick={() => onChange([])}
                className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1 text-center"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Component ──

export default function ResourceUtilization({ tasks, epics }: Props) {
  console.log("ResourceUtilization render", { tasks, epics });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Build an epicId → epic lookup for quick access
  const epicMap = useMemo(() => {
    const map: Record<string, Epic> = {};
    epics?.forEach((ep) => {
      map[ep.id] = ep;
    });
    return map;
  }, [epics]);

  // Derive one ResourceRow per unique assignee from real tasks
  const resourceRows = useMemo((): ResourceRow[] => {
    // First, filter tasks by date range if provided
    const filteredTasks = tasks.filter((t) => {
      if (!dateFrom && !dateTo) return true;
      const taskDate = t.startDate ?? t.createdAt;
      if (!taskDate) return true;
      const d = new Date(taskDate).getTime();
      const from = dateFrom ? new Date(dateFrom).getTime() : -Infinity;
      const to = dateTo ? new Date(dateTo).getTime() : Infinity;
      return d >= from && d <= to;
    });

    // Group filtered tasks by assigneeId
    const byAssignee: Record<string, Task[]> = {};
    filteredTasks.forEach((task) => {
      const key = task.assigneeId;
      if (!key) return; // skip unassigned
      if (!byAssignee[key]) byAssignee[key] = [];
      byAssignee[key].push(task);
    });

    return Object.entries(byAssignee).map(([userId, userTasks]) => {
      const user = getUserInfo(userId);

      const totalTasks = userTasks.length;
      const doneTasks = userTasks.filter((t) => isDone(t.status)).length;
      const inProgressTasks = userTasks.filter((t) =>
        isInProgress(t.status),
      ).length;
      const blockedTasks = userTasks.filter((t) => isBlocked(t.status)).length;
      const todoTasks = userTasks.filter((t) => isTodo(t.status)).length;

      const estimatedHours =
        Math.round(
          userTasks.reduce((sum, t) => sum + (t.estimatedHours ?? 0), 0) * 10,
        ) / 10;

      const actualHours =
        Math.round(
          userTasks.reduce((sum, t) => sum + (t.actualHours ?? 0), 0) * 10,
        ) / 10;

      // Utilization: actual / estimated * 100 (guard divide-by-zero)
      const utilizationPercentage =
        estimatedHours > 0
          ? Math.round((actualHours / estimatedHours) * 100)
          : 0;

      // Epic breakdown — group this user's tasks by epicId
      const epicTaskMap: Record<string, { total: number; done: number }> = {};

      userTasks.forEach((t) => {
        const eid = t.epicId;
        if (!eid) return;
        if (!epicTaskMap[eid]) epicTaskMap[eid] = { total: 0, done: 0 };
        epicTaskMap[eid].total += 1;
        if (isDone(t.status)) epicTaskMap[eid].done += 1;
      });

      const epicBreakdown = Object.entries(epicTaskMap).map(
        ([epicId, counts]) => {
          const epic = epicMap[epicId];
          return {
            epicId,
            epicName: epic?.name,
            totalTasks: counts.total,
            doneTasks: counts.done,
          };
        },
      );

      return {
        userId,
        userName: user.name,
        totalTasks,
        doneTasks,
        inProgressTasks,
        blockedTasks,
        todoTasks,
        estimatedHours,
        actualHours,
        utilizationPercentage,
        epicBreakdown,
      };
    });
  }, [tasks, epicMap, dateFrom, dateTo]);

  // Assignee options for the dropdown (derived from actual data)
  const assigneeOptions = useMemo(
    () => resourceRows.map((r) => ({ userId: r.userId, userName: r.userName })),
    [resourceRows],
  );

  // Apply filters
  const filteredData = useMemo(() => {
    return resourceRows.filter((res) => {
      const matchesSearch =
        !searchQuery ||
        res.userName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesAssignees =
        selectedAssignees.length === 0 ||
        selectedAssignees.includes(res.userId);

      return matchesSearch && matchesAssignees;
    });
  }, [resourceRows, searchQuery, selectedAssignees]);

  // Empty state: no tasks assigned to anyone
  if (resourceRows.length === 0) {
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
    <div className="space-y-4 mt-4">
      {/* ── Filter Bar ── */}
      <div className="flex items-end justify-between gap-3 flex-wrap">
        {/* Search — fixed width, left */}
        <div className="flex flex-col gap-1 w-[220px]">
          <label className="text-sm text-muted-foreground font-medium">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Name…"
              className="w-80 h-9 pl-8 pr-3 text-sm rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>

        {/* Right side — Assignee + Date range */}
        <div className="flex items-end gap-3 flex-wrap">
          {/* Assignee dropdown */}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-muted-foreground font-medium">
              Assignees
            </label>
            <AssigneeDropdown
              options={assigneeOptions}
              selected={selectedAssignees}
              onChange={setSelectedAssignees}
            />
          </div>

          {/* Date range */}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-muted-foreground font-medium">
              Date range
            </label>
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-9 pl-3 pr-8 text-sm rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring
                    [&::-webkit-calendar-picker-indicator]:opacity-0
                    [&::-webkit-calendar-picker-indicator]:absolute
                    [&::-webkit-calendar-picker-indicator]:inset-0
                    [&::-webkit-calendar-picker-indicator]:w-full
                    [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                />
                <CalendarDays className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              </div>
              <span className="text-muted-foreground text-sm select-none">
                -
              </span>
              <div className="relative">
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-9 pl-3 pr-8 text-sm rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring
                    [&::-webkit-calendar-picker-indicator]:opacity-0
                    [&::-webkit-calendar-picker-indicator]:absolute
                    [&::-webkit-calendar-picker-indicator]:inset-0
                    [&::-webkit-calendar-picker-indicator]:w-full
                    [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                />
                <CalendarDays className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      {filteredData.length === 0 ? (
        <Card className="border-dashed border-border shadow-none">
          <CardContent className="p-8 text-center text-muted-foreground">
            <Users className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="text-lg font-medium">No resource data available</p>
            <p className="text-sm mt-1">
              No team members match the current filters.
            </p>
          </CardContent>
        </Card>
      ) : (
       <Card className="border-border overflow-hidden rounded-2xl">
          <div className="overflow-auto max-h-[480px]">
            <table className="w-full text-left border-collapse border-spacing-y-2">
              <thead className="sticky top-0 z-10 bg-card rounded-2xl">
                <tr className="border-b border-border">
                  <th className="px-6 py-4 font-semibold text-xs uppercase text-muted-foreground">
                    Team Member
                  </th>
                  <th className="px-4 py-4 text-center font-semibold text-xs uppercase text-muted-foreground">
                    Tasks
                  </th>
                  <th className="px-4 py-4 text-center font-semibold text-xs uppercase text-muted-foreground">
                    Status Breakdown
                  </th>
                  <th className="px-4 py-4 text-center font-semibold text-xs uppercase text-muted-foreground">
                    Assigned (h)
                  </th>
                  <th className="px-4 py-4 text-center font-semibold text-xs uppercase text-muted-foreground">
                    Actual (h)
                  </th>
                  <th className="px-6 py-4 font-semibold text-xs uppercase text-muted-foreground w-[220px]">
                    Utilization
                  </th>
                </tr>
              </thead>

              {filteredData.map((res) => {
                let colorClass = "bg-green-500";
                if (res.utilizationPercentage > 110) colorClass = "bg-red-500";
                else if (res.utilizationPercentage > 90)
                  colorClass = "bg-yellow-500";
                else if (res.utilizationPercentage < 50)
                  colorClass = "bg-slate-400";

                return (
                  <tbody key={res.userId} className="group">
                    {/* Main row */}
                    <tr className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-secondary text-foreground flex items-center justify-center font-bold shrink-0">
                            {res.userName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">
                              {res.userName}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="font-bold text-lg text-foreground">
                          {res.totalTasks}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap items-center justify-center gap-1.5">
                          {res.doneTasks > 0 && (
                            <span className="inline-flex items-center gap-1 text-[12px] px-1.5 py-0.5 rounded bg-green-500/40 text-green-400 font-medium">
                              {res.doneTasks} done
                            </span>
                          )}
                          {res.inProgressTasks > 0 && (
                            <span className="inline-flex items-center gap-1 text-[12px] px-1.5 py-0.5 rounded bg-blue-500/40 text-blue-400 font-medium">
                              {res.inProgressTasks} active
                            </span>
                          )}
                          {res.todoTasks > 0 && (
                            <span className="inline-flex items-center gap-1 text-[12px] px-1.5 py-0.5 rounded bg-slate-500/30 text-slate-300 font-medium">
                              {res.todoTasks} todo
                            </span>
                          )}
                          {res.blockedTasks > 0 && (
                            <span className="inline-flex items-center gap-1 text-[12px] px-1.5 py-0.5 rounded bg-red-500/40 text-red-400 font-medium">
                              {res.blockedTasks} blocked
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center font-medium text-foreground">
                        {res.estimatedHours}h
                      </td>
                      <td className="px-4 py-4 text-center font-medium text-foreground">
                        {res.actualHours}h
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2.5 bg-secondary rounded-full overflow-hidden">
                            <div
                              className={`h-full ${colorClass} transition-all duration-1000`}
                              style={{
                                width: `${Math.min(res.utilizationPercentage, 100)}%`,
                              }}
                            />
                          </div>
                          <span className="font-bold w-12 text-right text-foreground">
                            {res.utilizationPercentage}%
                          </span>
                        </div>
                      </td>
                    </tr>

                    {/* Epic breakdown row — shown on hover */}
                    {res.epicBreakdown.length > 0 && (
                      <tr className="border-b border-border/30 hidden group-hover:table-row bg-secondary/10">
                        <td colSpan={6} className="px-6 pb-4 pt-2">
                          <div className="pl-14 pr-4 pt-3">
                            <p className="text-[11px] uppercase font-bold text-muted-foreground mb-3 flex items-center tracking-wider">
                              <TrendingUp className="h-3.5 w-3.5 mr-1.5" /> Epic
                              Breakdown
                            </p>
                            <div className="grid grid-cols-2 gap-3 mx-2">
                              {res.epicBreakdown.map((ep) => (
                                <div
                                  key={ep.epicId}
                                  className="text-xs border border-border p-3 rounded-lg"
                                >
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="truncate pr-2 font-semibold text-foreground">
                                      {ep.epicName}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 h-1.5 bg-secondary blue-dark:bg-[#313b4f]  rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-primary transition-all"
                                        style={{
                                          width: `${
                                            ep.totalTasks > 0
                                              ? Math.round(
                                                  (ep.doneTasks /
                                                    ep.totalTasks) *
                                                    100,
                                                )
                                              : 0
                                          }%`,
                                        }}
                                      />
                                    </div>
                                    <span className="text-muted-foreground font-medium">
                                      {ep.doneTasks}/{ep.totalTasks}
                                    </span>
                                  </div>
                                </div>
                              ))}
                              
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                );
              })}
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
