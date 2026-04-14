import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "ikon-react-components-lib";
import { FaBolt, FaClock } from "react-icons/fa";

import { ChevronRight } from "lucide-react";
import { MdDashboard } from "react-icons/md";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "ikon-react-components-lib";
import { MoreHorizontal } from "lucide-react";
import { MdOutlineEdit } from "react-icons/md";
import { RiDeleteBinLine } from "react-icons/ri";
import { VscDebugStart } from "react-icons/vsc";
import { GiBackwardTime } from "react-icons/gi";
import { MdOutlineTimer } from "react-icons/md";

export default function Backlog() {
  return (
    <div className="w-full rounded-xl">
      <Accordion type="single" collapsible className="w-full">
        <div className="border  rounded-xl">
          <AccordionItem
            value="project-1"
            className=" rounded-xl overflow-hidden"
          >
            {/* PROJECT HEADER */}
            <AccordionTrigger className="group hover:no-underline px-3 py-3 [&[data-state]>svg]:hidden">
              <div className="flex items-center justify-between w-full min-w-0 cursor-pointer">
                {/* LEFT */}
                <div className="flex items-center gap-3 min-w-0">
                  <ChevronRight className="h-4 w-4  transition-transform duration-200 group-data-[state=open]:rotate-90 shrink-0" />

                  <div className="h-8 w-8 flex items-center justify-center rounded-full  border ">
                    <MdDashboard className="text-[#61DAFB] text-sm" />
                  </div>

                  <div className="min-w-0">
                    <p className="font-semibold truncate">tyf</p>
                    <p className="text-sm  truncate">hyguy</p>
                  </div>
                </div>

                {/* RIGHT */}
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs ">1 sprints</span>
                  <div className=" px-2 py-1 rounded-md border ">
                    + Add Task
                  </div>
                </div>
              </div>
            </AccordionTrigger>
            <hr className="" />
            {/* CONTENT */}

            <AccordionContent className="px-2 pb-2 py-2 overflow-hidden">
              <div className=" px-6 py-4 flex items-center justify-between w-full ">
                {/* Left Section */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <FaBolt className="text-yellow-400 text-md" />
                    <span className=" font-semibold text-sm">
                      Nihil aut quia vero
                    </span>
                  </div>

                  {/* Status Badges */}
                  <div className="flex items-center gap-2 ml-4">
                    <span className="px-3 py-1 border  rounded-full text-xs font-medium">
                      TODO
                    </span>
                    <span className="px-3 py-1 border  rounded-full text-xs font-medium">
                      MEDIUM
                    </span>
                  </div>
                </div>

                {/* Right Section */}
                <div className="group flex items-center gap-2">
                  <FaClock className="" />
                  <span className="font-medium">90h</span>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div className="p-0  border-none outline-none">
                        <MoreHorizontal size={18} className=" cursor-pointer" />
                      </div>
                    </DropdownMenuTrigger>

                    {/* Dropdown */}
                    <DropdownMenuContent
                      align="end"
                      className=" border  rounded-lg"
                    >
                      <DropdownMenuItem className=" rounded-md">
                        <MdOutlineEdit className="inline mr-2 text-white-400" />
                        Edit Task
                      </DropdownMenuItem>

                      <DropdownMenuItem className=" rounded-md">
                        <MdOutlineTimer className="inline mr-2 " />
                        Log Time
                      </DropdownMenuItem>

                      <DropdownMenuItem className=" rounded-md">
                        <GiBackwardTime className="inline mr-2 " />
                        View Time Logs
                      </DropdownMenuItem>

                      <DropdownMenuItem className=" rounded-md">
                        <VscDebugStart className="inline mr-2 " />
                        Move to Sprint
                      </DropdownMenuItem>
                      <hr className=" py-1 font-bold" />
                      <DropdownMenuItem className=" ">
                        <RiDeleteBinLine className="inline mr-2 " />
                        Delete Epic
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </div>
      </Accordion>
    </div>
  );
}
