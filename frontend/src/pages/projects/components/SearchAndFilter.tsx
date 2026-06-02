// SearchAndFilter.tsx
"use client";

import { Input, ComboboxInput } from "ikon-react-components-lib";
import { Search, Filter } from "lucide-react";
import { TaskEnum } from "@/enums/task.constants";
import { SprintEnum } from "@/enums/sprint.constants";

const statusItems = [
  { label: "All Status", value: "ALL" },
  { label: "To Do", value: TaskEnum.Status.TODO },
  { label: "In Progress", value: TaskEnum.Status.IN_PROGRESS },
  { label: "Done", value: TaskEnum.Status.DONE },
  { label: "Blocked", value: TaskEnum.Status.BLOCKED },
];

const priorityItems = [
  { label: "All Priority", value: "ALL" },
  { label: "Critical", value: TaskEnum.Priority.CRITICAL },
  { label: "Low", value: TaskEnum.Priority.LOW },
  { label: "Medium", value: TaskEnum.Priority.MEDIUM },
  { label: "High", value: TaskEnum.Priority.HIGH },
];

const typeItems = [
  { label: "All Types", value: "ALL" },
  { label: "Task", value: TaskEnum.Type.TASK },
  { label: "Bug", value: TaskEnum.Type.BUG },
  { label: "Story", value: TaskEnum.Type.STORY },
];

const sprintStateItems = [
  { label: "All Sprints", value: "ALL" },
  { label: "Active", value: SprintEnum.Status.ACTIVE },
  { label: "Planned", value: SprintEnum.Status.PLANNED },
  { label: "Completed", value: SprintEnum.Status.COMPLETED },
  { label: "Cancelled", value: SprintEnum.Status.CANCELLED },
];

export interface FilterState {
  search: string;
  status: string;
  priority: string;
  type: string;
  sprintState: string;
}

interface SearchAndFilterProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}
export default function SearchAndFilter({
  filters,
  onChange,
}: SearchAndFilterProps) {
  return (
    <div className="w-full flex flex-wrap items-center gap-3 my-4">
      {/* SEARCH */}
      <div className="flex items-center w-[300px] border rounded-lg ps-3">
        <Search className="mr-2" />
        <Input
          placeholder="Search tasks..."
          className="border-none focus-visible:ring-0 dark:bg-[#0a0a0a]"
          value={filters.search}
          onChange={(e) => {
            onChange({ ...filters, search: e.target.value });
          }}
        />
      </div>

      {/* STATUS */}
      <div className="relative">
        <Filter className="absolute left-3 top-2.5 h-4 w-4" />
        <div className="[&>button]:pl-10!">
          <ComboboxInput
            placeholder="All Status"
            items={statusItems}
            defaultValue={filters.status}
            onSelect={(v) => onChange({ ...filters, status: v as string })}
          />
        </div>
      </div>

      {/* PRIORITY */}
      <div className="flex items-center w-40 gap-2 border rounded-lg">
        <div className="flex-1">
          <ComboboxInput
            placeholder="All Priority"
            items={priorityItems}
            defaultValue={filters.priority}
            onSelect={(v) => onChange({ ...filters, priority: v as string })}
          />
        </div>
      </div>

      {/* TYPE */}
      <div className="flex items-center w-40 gap-2 border rounded-lg">
        <div className="flex-1">
          <ComboboxInput
            placeholder="All Types"
            items={typeItems}
            defaultValue={filters.type}
            onSelect={(v) => onChange({ ...filters, type: v as string })}
          />
        </div>
      </div>

      {/* SPRINT STATE */}
      <div className="flex items-center w-40 gap-2 border rounded-lg">
        <div className="flex-1">
          <ComboboxInput
            placeholder="All Sprints"
            items={sprintStateItems}
            defaultValue={filters.sprintState}
            onSelect={(v) => onChange({ ...filters, sprintState: v as string })}
          />
        </div>
      </div>
    </div>
  );
}
