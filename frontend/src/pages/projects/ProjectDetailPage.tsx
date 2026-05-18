import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Button,
} from "ikon-react-components-lib";
import { CiCalendar } from "react-icons/ci";
import TaskList from "./components/TaskList";
import { Upload, Plus, List, LayoutGrid, Users } from "lucide-react";
import SearchAndFilter from "./components/SearchAndFilter";
import TaskBoard from "./components/TaskBoard";
import ResourceUtilization from "./components/ResouceUtilisation";
import { SimpleWidget } from "ikon-react-components-lib";
import { useState } from "react";
import AddEpicModal, { type EpicFormValues } from "./components/AddEpicModal";
import {
  
  useCreateEpicMutation,
} from "@/features/epics/epicsApiSlice";
import { useParams } from "react-router-dom";

export default function ProjectDetailPage() {
  
  const [createEpic] = useCreateEpicMutation();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { id } = useParams();

  const handleCreateEpic = async (data: EpicFormValues) => {
    try {
      if (!id) {
        console.error("Project ID missing");
        return;
      }
     
      setLoading(true);

      await createEpic({
        ...data,
        projectId :id,
      }).unwrap();

      setOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* ================= TOP PROJECT CARD ================= */}
      <div className="border blue-dark:bg-red-500 rounded-4xl ">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:px-6 md:py-2">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg md:text-xl font-semibold">fdg</h2>
              <span className="text-xs px-3 py-1 rounded-full border">
                NOT STARTED
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-1">fs</p>
          </div>

          {/* Date */}
          <div className="flex items-center gap-2 border px-4 py-2 rounded-xl text-sm w-fit">
            <CiCalendar className="text-lg" />
            <span>Feb 2, 2026 - Dec 31, 2026</span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t"></div>

        {/* State */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
          <div>
            <SimpleWidget
              title="Completion"
              primaryText="0%"
              secondaryText=""
              iconName=""
              mainClassName="p-0 border-none shadow-none bg-transparent"
            />
          </div>

          <div>
            <SimpleWidget
              title="Tasks (Total / Done)"
              primaryText="0 / 0"
              secondaryText=""
              iconName=""
              mainClassName="p-0 border-none shadow-none bg-transparent"
            />
          </div>

          <div>
            <SimpleWidget
              title="Estimated Hours"
              primaryText="0h"
              secondaryText=""
              iconName=""
              mainClassName="p-0 border-none shadow-none bg-transparent"
            />
          </div>

          <div>
            <SimpleWidget
              title="Actual Hours"
              primaryText="0h"
              secondaryText=""
              iconName=""
              mainClassName="p-0 border-none shadow-none bg-transparent"
            />
          </div>
        </div>
      </div>

      {/* ================= TABS SECTION ================= */}
      <div className="mt-6 flex flex-col gap-4">
        {/* Top Row */}
        <Tabs defaultValue="task" className="w-full">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* LEFT → Tabs */}
            <TabsList className=" border rounded-xl p-1 flex gap-1 w-fit">
              <TabsTrigger value="task">
                <List size={16} /> Task List
              </TabsTrigger>

              <TabsTrigger value="board">
                <LayoutGrid size={16} /> Board
              </TabsTrigger>

              <TabsTrigger value="resource">
                <Users size={16} /> Resource Utilisation
              </TabsTrigger>
            </TabsList>

            {/* RIGHT → Buttons */}
            <div className="flex md:justify-end gap-3">
              <Button variant="outline">
                <Upload size={16} className="mr-2" />
                Bulk Upload
              </Button>

              <Button onClick={() => setOpen(true)}>
                <Plus size={16} className="mr-2" />
                Add Epic
              </Button>
            </div>
          </div>

          {/* TASK TAB CONTENT */}
          <TabsContent value="task">
            <TaskList />
          </TabsContent>

          {/* BOARD TAB CONTENT */}
          <TabsContent value="board">
            <SearchAndFilter />
            <TaskBoard />
          </TabsContent>

          {/* RESOURCE TAB CONTENT */}
          <TabsContent value="resource">
            <ResourceUtilization />
          </TabsContent>
        </Tabs>
      </div>
      <AddEpicModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleCreateEpic}
        isLoading={loading}
      />
    </div>
  );
}
