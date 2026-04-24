import { DataTableLayout, Tabs, TabsContent, TabsList, TabsTrigger } from "ikon-react-components-lib";
//import ProjectDetailsPage from "../projects/ProjectDetailPage";
import ProjectMemberView from "./components/ProjectMemberView";
import { CalendarDays, FolderKanban, Users } from "lucide-react";
import TimeSheet from "./components/TimeSheet";

//Types
type ResourceMember = {
  id: string;
  name: string;
  email: string;
  capacity: number;
  planned: number;
  actual: number;
};

const ResourceUtilisationPage: React.FC = () => {

  // Dummy data for Team member view table
  const resourceData: ResourceMember[] = [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      capacity: 160,
      planned: 140,
      actual: 150,
    },
    {
      id: "2",
      name: "Alice Smith",
      email: "alice@example.com",
      capacity: 160,
      planned: 120,
      actual: 100,
    },
  ];

  //Team view Data Table Columns
  const columns = [
    {
      accessorKey: "name",
      header: () => <div className="font-semibold">Team Member</div>,
      cell: ({ row }: { row: { original: ResourceMember } }) => {
        const user = row.original;
        return (
          <div>
            <div className="font-medium">{user.name}</div>
            <div className="text-xs text-gray-400">{user.email}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "capacity",
      header: () => <div className="font-semibold">Capacity</div>,
      cell: ({ row }: { row: { original: ResourceMember } }) => <span>{row.original.capacity}h</span>,
    },
    {
      accessorKey: "planned",
      header: () => <div className="font-semibold">Planned</div>,
      cell: ({ row }: { row: { original: ResourceMember } }) => <span>{row.original.planned}h</span>,
    },
    {
      accessorKey: "actual",
      header: () => <div className="font-semibold">Actual</div>,
      cell: ({ row }: { row: { original: ResourceMember } }) => <span>{row.original.actual}h</span>,
    },
    {
      id: "utilisation",
      header: () => <div className="font-semibold">Utilisation %</div>,
      cell: ({ row }: { row: { original: ResourceMember } }) => {
        const { capacity, actual } = row.original;
        const utilisation = Math.round((actual / capacity) * 100);

        let color = "text-green-500";
        if (utilisation > 100) color = "text-red-500";
        else if (utilisation > 80) color = "text-yellow-500";

        return <span className={color}>{utilisation}%</span>;
      },
    },
  ];

  return (
    <div className="p-4 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Resource Utilisation</h1>
        <p className="text-muted-foreground">
          Monitor team capacity and workload across all projects.
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="team">
        <TabsList>
          <TabsTrigger value="team" className="flex gap-2 items-center">
            <Users className="h-4 w-4" /> Team Member View
          </TabsTrigger>

          <TabsTrigger value="project" className="flex gap-2 items-center">
            <FolderKanban className="h-4 w-4" /> Project View
          </TabsTrigger>

          <TabsTrigger value="timesheet" className="flex gap-2 items-center">
            <CalendarDays className="h-4 w-4" /> Timesheet
          </TabsTrigger>
        </TabsList>

        {/* Team View */}
        <TabsContent value="team" className="mt-5">
          <DataTableLayout
            data={resourceData}
            columns={columns}
            extraTools={{
              totalPages: 1
            }}
          />
        </TabsContent>


        {/* Project View */}
        <TabsContent value="project" className="mt-5">
          <ProjectMemberView />
        </TabsContent>


        {/* Timesheet */}
        <TabsContent value="timesheet" className="mt-5">
            <TimeSheet />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResourceUtilisationPage;