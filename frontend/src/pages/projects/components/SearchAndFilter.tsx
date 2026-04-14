"use client";

import { useState } from "react";
import { Input, ComboboxInput } from "ikon-react-components-lib";
import { IoSearch } from "react-icons/io5";
import { CiFilter } from "react-icons/ci";

const statusItems = [
  { label: "All Status", value: "All Status" },
  { label: "To Do", value: "To Do" },
  { label: "In Progress", value: "In Progress" },
  { label: "Done", value: "Done" },
  { label: "Blocked", value: "Blocked" },
];

const priorityItems = [
  { label: "All Priority", value: "All Priority" },
  { label: "Critical", value: "Critical" },
  { label: "Low", value: "Low" },
  { label: "Medium", value: "Medium" },
  { label: "High", value: "High" },
];

const typeItems = [
  { label: "All Types", value: "All Types" },
  { label: "Task", value: "Task" },
  { label: "Bug", value: "Bug" },
  { label: "Story", value: "Story" },
  { label: "Improvement", value: "Improvement" },
];

const stateItems = [
  { label: "All Sprints", value: "All Sprints" },
  { label: "Active Sprints", value: "Active Sprints" },
  { label: "Planned", value: "Planned" },
  { label: "Completed", value: "Completed" },
  { label: "Cancelled", value: "Cancelled" },
];

export default function SearchAndFilter() {
  const [status, setStatus] = useState("All Status");
  const [priority, setPriority] = useState("All Priority");
  const [type, setType] = useState("All Types");
  const [state, setState] = useState("All Sprints");

  return (
    <div className="w-full flex flex-wrap items-center gap-3 my-4">
      {/* SEARCH */}
      <div className="flex items-center w-[300px] border rounded-lg ps-3">
        <IoSearch className="mr-2" />
        <Input
          placeholder="Search..."
          className="border-none focus-visible:ring-0"
        />
      </div>

      {/* STATUS */}
      <div className="flex items-center w-40 gap-2 ps-2 border rounded-lg">
        <CiFilter className="text-lg font-bold" />
        <div className="flex-1">
          <ComboboxInput
            placeholder="All Status"
            items={statusItems}
            defaultValue={status}
            onSelect={(value) => setStatus(value as string)}
          />
        </div>
      </div>

      {/* PRIORITY */}
      <div className="flex items-center w-40 gap-2 border rounded-lg">
        <div className="flex-1">
          <ComboboxInput
            placeholder="All Priority"
            items={priorityItems}
            defaultValue={priority}
            onSelect={(value) => setPriority(value as string)}
          />
        </div>
      </div>

      {/* TYPE */}
      <div className="flex items-center w-40 gap-2 border rounded-lg">
        <div className="flex-1">
          <ComboboxInput
            placeholder="All Types"
            items={typeItems}
            defaultValue={type}
            onSelect={(value) => setType(value as string)}
          />
        </div>
      </div>

      {/* STATE */}
      <div className="flex items-center w-40 gap-2 border rounded-lg">
        <div className="flex-1">
          <ComboboxInput
            placeholder="All Sprints"
            items={stateItems}
            defaultValue={state}
            onSelect={(value) => setState(value as string)}
          />
        </div>
      </div>
    </div>
  );
}
