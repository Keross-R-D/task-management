"use client";

import { useState } from "react";
import { Input } from "ikon-react-components-lib";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

import { IoSearch } from "react-icons/io5";
import { CiFilter } from "react-icons/ci";

// Added default options inside arrays
const statusItems = ["All Status", "To Do", "In Progress", "Done", "Blocked"];
const priorityItems = ["All Priority", "Critical", "Low", "Medium", "High"];
const typeItems = ["All Types", "Task", "Bug", "Story", "Improvement"];
const stateItems = ["All Sprints", "Active Sprints", "Planned", "Completed", "Cancelled"];

export default function SearchAndFilter() {

  // Default selected values
  const [status, setStatus] = useState<string | null>("All Status");
  const [priority, setPriority] = useState<string | null>("All Priority");
  const [type, setType] = useState<string | null>("All Types");
  const [state, setState] = useState<string | null>("All Sprints");

  return (
    <div className="w-full flex flex-wrap items-center gap-3 my-4">

      {/* SEARCH */}
      <div className="flex items-center w-[300px]  border  rounded-lg ps-3">
        <IoSearch className=" mr-2" />
        <Input
          placeholder="Search..."
          className="border-none focus-visible:ring-0"
        />
      </div>

      {/* STATUS */}
      <div className="flex items-center w-40 gap-2 ps-2 border  rounded-lg">
        <CiFilter className="text-lg font-bold" />

        <Combobox items={statusItems} value={status} onValueChange={setStatus}>
          <ComboboxInput
            placeholder="All Status"
            className=" border-none  focus:ring-0"
          />
          <ComboboxContent>
            <ComboboxEmpty>No items found.</ComboboxEmpty>
            <ComboboxList>
              {(item) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>

      {/* PRIORITY */}
      <div className="flex items-center w-40 gap-2 border  rounded-lg ">
        <Combobox items={priorityItems} value={priority} onValueChange={setPriority}>
          <ComboboxInput
            placeholder="All Priority"
            className=" border-none  focus:ring-0"
          />
          <ComboboxContent>
            <ComboboxEmpty>No items found.</ComboboxEmpty>
            <ComboboxList>
              {(item) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>

      {/* TYPE */}
      <div className="flex items-center w-40 gap-2 border  rounded-lg ">
        <Combobox items={typeItems} value={type} onValueChange={setType}>
          <ComboboxInput
            placeholder="All Types"
            className=" border-none  focus:ring-0"
          />
          <ComboboxContent>
            <ComboboxEmpty>No items found.</ComboboxEmpty>
            <ComboboxList>
              {(item) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>

      {/* STATE */}
      <div className="flex items-center w-40 gap-2 border  rounded-lg ">
        <Combobox items={stateItems} value={state} onValueChange={setState}>
          <ComboboxInput
            placeholder="All Sprints"
            className=" border-none  focus:ring-0"
          />
          <ComboboxContent>
            <ComboboxEmpty>No items found.</ComboboxEmpty>
            <ComboboxList>
              {(item) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>

    </div>
  );
}