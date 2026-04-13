import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "ikon-react-components-lib";

import { ChevronRight } from "lucide-react";
import { LuTarget } from "react-icons/lu";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "ikon-react-components-lib";
import { FaPlus } from "react-icons/fa6";
import { MoreHorizontal } from "lucide-react";
import { MdOutlineEdit } from "react-icons/md";
import { RiDeleteBinLine } from "react-icons/ri";
import { VscDebugStart } from "react-icons/vsc";
import { GiCancel } from "react-icons/gi";

export default function Epic() {
  return (
    <div className="w-full  p-4 rounded-xl border my-4">
      <Accordion type="single" collapsible className="w-full">
        <div className="border rounded-xl">
          <AccordionItem
            value="project-1"
            className=" rounded-xl overflow-hidden"
          >
            {/* PROJECT HEADER */}
            <AccordionTrigger className="group hover:no-underline px-3 py-3 [&[data-state]>svg]:hidden">
              <div className="flex items-center justify-between w-full min-w-0">
                {/* LEFT */}
                <div className="flex items-center gap-3 min-w-0">
                  <ChevronRight className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-90 shrink-0" />

                  {/* React Icon (added) */}
                  <div className="h-8 w-8 flex items-center justify-center rounded-full  border">
                    <LuTarget className="text-[#61DAFB] text-lg" />
                  </div>

                  <div className="min-w-0">
                    <p className="font-semibold truncate">tyf</p>
                    <p className="text-sm text-gray-400 truncate">hyguy</p>
                  </div>
                </div>

                {/* RIGHT */}
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs  px-2 py-1 rounded-md border ">
                    1 sprints
                  </span>

                  <DropdownMenu>
                    {/* Trigger → clean icon */}
                    <DropdownMenuTrigger asChild>
                      <div className="p-0  border-none outline-none">
                        <MoreHorizontal size={18} className=" cursor-pointer" />
                      </div>
                    </DropdownMenuTrigger>

                    {/* Dropdown */}
                    <DropdownMenuContent
                      align="end"
                      className=" border rounded-lg"
                    >
                      <DropdownMenuItem className=" rounded-md">
                        <FaPlus className="inline mr-2 " />
                        Add Sprint
                      </DropdownMenuItem>

                      <DropdownMenuItem className=" rounded-md">
                        <MdOutlineEdit className="inline mr-2" />
                        Edit Epic
                      </DropdownMenuItem>
                      <hr className="border-red-800 my-1" />
                      <DropdownMenuItem className="">
                        <RiDeleteBinLine className="inline mr-2 " />
                        Delete Epic
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </AccordionTrigger>
            <hr className="border" />
            {/* CONTENT */}

            <AccordionContent className="px-2 pb-2 py-2 overflow-hidden">
              <Accordion type="single" collapsible className="w-full">
                <div className="border  rounded-xl">
                  <AccordionItem value="sprint-1" className="border rounded-lg">
                    {/* SPRINT HEADER */}
                    <AccordionTrigger className="group hover:no-underline px-3 py-3 [&[data-state]>svg]:hidden">
                      <div className="flex items-center justify-between w-full min-w-0">
                        {/* LEFT */}
                        <div className="flex items-center gap-3 min-w-0">
                          <ChevronRight className="h-4 w-4  transition-transform duration-200 group-data-[state=open]:rotate-90 shrink-0" />

                          <div className="flex items-center gap-3 min-w-0 flex-wrap">
                            <span className="font-medium truncate">dff</span>

                            <span className="text-xs  px-2 py-1 rounded-md border  shrink-0">
                              Planned
                            </span>

                            <span className="text-sm truncate">
                              (Jan 11 - Jan 12)
                            </span>
                          </div>
                        </div>

                        {/* RIGHT */}
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-sm ">0 tasks</span>
                          <DropdownMenu>
                            {/* Trigger → clean icon */}
                            <DropdownMenuTrigger asChild>
                              <div className="p-0  border-none outline-none">
                                <MoreHorizontal
                                  size={18}
                                  className=" cursor-pointer"
                                />
                              </div>
                            </DropdownMenuTrigger>

                            {/* Dropdown */}
                            <DropdownMenuContent
                              align="end"
                              className=" border  rounded-lg"
                            >
                              <DropdownMenuItem className=" rounded-md">
                                <FaPlus className="inline mr-2 text-white-400" />
                                Add Task
                              </DropdownMenuItem>

                              <DropdownMenuItem className=" rounded-md">
                                <MdOutlineEdit className="inline mr-2" />
                                Edit Sprint
                              </DropdownMenuItem>
                              <hr className=" my-1" />
                              <DropdownMenuItem className=" rounded-md">
                                <VscDebugStart className="inline mr-2" />
                                Start Sprint
                              </DropdownMenuItem>

                              <DropdownMenuItem className="rounded-md">
                                <GiCancel className="inline mr-2" />
                                Cancel Sprint
                              </DropdownMenuItem>
                              <hr className=" py-1 font-bold" />
                              <DropdownMenuItem className="">
                                <RiDeleteBinLine className="inline mr-2" />
                                Delete Epic
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </AccordionTrigger>

                    <hr className="" />
                    <AccordionContent className="px-3 pb-3">
                      <div className=" rounded-md  px-3 py-3">
                        <p className=" text-sm">No tasks matching filters.</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </div>
              </Accordion>
            </AccordionContent>
          </AccordionItem>
        </div>
      </Accordion>
    </div>
  );
}
