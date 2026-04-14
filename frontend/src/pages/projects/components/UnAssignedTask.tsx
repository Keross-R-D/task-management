import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Button,
} from "ikon-react-components-lib";
import { FaBolt, FaClock } from "react-icons/fa";

import { ChevronRight } from "lucide-react";
import { MdDashboard } from "react-icons/md";

export default function UnAssignedTask() {
  return (
    <div className="w-full  p-4 rounded-xl border ">
      <Accordion type="single" collapsible className="w-full">
        <div className="border  rounded-xl">
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

                  <div className="h-8 w-8 flex items-center justify-center rounded-full  border ">
                    <MdDashboard className=" text-sm" />
                  </div>

                  <div className="min-w-0">
                    <p className="font-semibold truncate">tyf</p>
                    <p className="text-sm  truncate">hyguy</p>
                  </div>
                </div>

                {/* RIGHT */}
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs ">1 sprint</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className=" px-2 py-1 rounded-md border "
                  >
                    + Add Task
                  </Button>
                </div>
              </div>
            </AccordionTrigger>
            <hr className="" />
            {/* CONTENT */}

            <AccordionContent className="px-2 pb-2 py-2 overflow-hidden">
              <div className=" px-6 py-4 flex items-center justify-between w-full border-b ">
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
                    <span className="px-3 py-1  rounded-full text-xs font-medium">
                      TODO
                    </span>
                    <span className="px-3 py-1 bg-orange-600 rounded-full text-xs font-medium">
                      MEDIUM
                    </span>
                  </div>
                </div>

                {/* Right Section */}
                <div className="group flex items-center gap-2">
                  <FaClock className="" />
                  <span className=" font-medium">90h</span>

                  <span className=" opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    •••
                  </span>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </div>
      </Accordion>
    </div>
  );
}
