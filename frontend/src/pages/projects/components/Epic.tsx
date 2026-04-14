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
import { MdDashboard, MdOutlineEdit, MdOutlineTimer } from "react-icons/md";
import { RiDeleteBinLine } from "react-icons/ri";
import { VscDebugStart } from "react-icons/vsc";
import { GiBackwardTime, GiCancel } from "react-icons/gi";

import { FiClock } from "react-icons/fi";
import { MdOutlineCalendarToday } from "react-icons/md";
import { FaBolt } from "react-icons/fa";

export default function Epic() {
  return (
    <div className="w-full rounded-xl my-4">
      <Accordion type="single" collapsible className="w-full">
        <div className="border rounded-xl ">
          <AccordionItem
            value="project-1"
            className=" rounded-xl overflow-hidden"
          >
            {/* PROJECT HEADER */}
            <AccordionTrigger className="group hover:no-underline px-3 py-3 [&[data-state]>svg]:hidden">
              <div className="flex items-center justify-between w-full min-w-0 cursor-pointer">
                {/* LEFT */}
                <div className="flex items-center gap-3 min-w-0">
                  <ChevronRight className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-90 shrink-0" />

                  {/* React Icon*/}
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
                      <div className="flex items-center justify-between w-full min-w-0 cursor-pointer">
                        {/* LEFT */}
                        <div className="flex items-center gap-3 min-w-0">
                          <ChevronRight className="h-4 w-4  transition-transform duration-200 group-data-[state=open]:rotate-90 shrink-0" />

                          <div className="flex items-center gap-3 min-w-0 flex-wrap">
                            <MdDashboard className=" text-sm text-blue-400" />
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
                    <AccordionContent className="px-3 pb-0">
                      <div className="w-full border px-6 my-2 py-2 flex items-center justify-between rounded-md">
                        {/* LEFT SIDE  */}
                        <div className="flex items-center gap-3">
                          <FaBolt className="text-yellow-400 text-sm" />

                          {/* CONTENT */}
                          <div className="flex flex-col gap-2">
                            <h1 className="text-lg font-semibold">
                              Recusandae Consequa
                            </h1>

                            <div className="flex items-center gap-3 text-sm">
                              <div className="flex items-center gap-2">
                                <span className="bg-red-600/20 text-red-400 px-2 py-[2px] rounded-md text-xs font-semibold">
                                  BLOCKED
                                </span>
                                <span className="bg-red-600/20 text-red-400 px-2 py-[2px] rounded-md text-xs font-semibold">
                                  CRITICAL
                                </span>
                              </div>

                              <div className="flex items-center gap-1">
                                <MdOutlineCalendarToday className="text-xs" />
                                <span className="text-xs">Oct 16, 1998</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* RIGHT SECTION */}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-sm">
                            <FiClock className="text-sm" />
                            <span>0/54h</span>
                          </div>

                          <DropdownMenu>
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
                              <DropdownMenuItem className=" rounded-md">
                                Set To Do
                              </DropdownMenuItem>
                              <DropdownMenuItem className=" rounded-md">
                                Set In Progress
                              </DropdownMenuItem>
                              <DropdownMenuItem className=" rounded-md">
                                Set Done
                              </DropdownMenuItem>

                              <hr className=" py-1 font-bold" />
                              <DropdownMenuItem className=" ">
                                <RiDeleteBinLine className="inline mr-2 " />
                                Delete Task
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
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
