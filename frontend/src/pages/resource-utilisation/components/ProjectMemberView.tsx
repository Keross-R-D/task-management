import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, DataTableLayout, Progress } from 'ikon-react-components-lib';
import { ChevronRight, Dot } from 'lucide-react';
import React from 'react';

const ProjectMemberView: React.FC = () => {
    //Project view DataTable columns
    type ProjectMember = {
        id: string;
        name: string;
        email: string;
        tasks: number;
        completed: number;
        planned: number;
        actual: number;
    };

    //Columns for project view table
    const projectColumns = [
        {
            accessorKey: "name",
            header: () => <div className="font-semibold">Team Member</div>,
            cell: ({ row }: { row: { original: ProjectMember } }) => {
                const user = row.original;
                return (
                    <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-muted-foreground">
                            {user.email}
                        </div>
                    </div>
                );
            },
        },

        {
            accessorKey: "tasks",
            header: () => <div className="font-semibold">Tasks</div>,
            cell: ({ row }: { row: { original: ProjectMember } }) => (
                <span>{row.original.tasks}</span>
            ),
        },

        {
            accessorKey: "completed",
            header: () => <div className="font-semibold">Completed</div>,
            cell: ({ row }: { row: { original: ProjectMember } }) => (
                <span className="text-green-500 font-medium">
                    {row.original.completed}
                </span>
            ),
        },

        {
            accessorKey: "planned",
            header: () => <div className="font-semibold">Planned Hours</div>,
            cell: ({ row }: { row: { original: ProjectMember } }) => (
                <span>{row.original.planned}h</span>
            ),
        },

        {
            accessorKey: "actual",
            header: () => <div className="font-semibold">Actual Hours</div>,
            cell: ({ row }: { row: { original: ProjectMember } }) => (
                <span>{row.original.actual}h</span>
            ),
        },

        {
            id: "utilisation",
            header: () => (
                <div className="font-semibold">Planned vs Actual</div>
            ),
            cell: ({ row }: { row: { original: ProjectMember } }) => {
                const { planned, actual } = row.original;

                let color = "text-red-500";

                if (actual >= planned) color = "text-green-500";
                else if (actual > planned * 0.6) color = "text-yellow-500";

                return (
                    <span className={`font-medium ${color}`}>
                        {actual}h / {planned}h
                    </span>
                );
            },
        }
    ];

    //Dummy data for project Members
    const projectData: ProjectMember[] = [
        {
            id: "1",
            name: "John Doe",
            email: "john@example.com",
            tasks: 12,
            completed: 8,
            planned: 40,
            actual: 38,
        },
        {
            id: "2",
            name: "Alice Smith",
            email: "alice@example.com",
            tasks: 10,
            completed: 10,
            planned: 35,
            actual: 42,
        },
        {
            id: "3",
            name: "Bob Johnson",
            email: "bob@example.com",
            tasks: 8,
            completed: 5,
            planned: 25,
            actual: 10,
        },
    ];

    return (
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

                                <div className="min-w-0">
                                    <p className="text-lg font-semibold truncate">Project 1</p>
                                    <p className="flex text-sm text-gray-400 truncate">30 tasks<Dot />90% Complete<Dot />3 Members</p>
                                </div>
                            </div>

                            {/* RIGHT */}
                            <div className="flex items-center gap-3 shrink-0">
                                <span className="text-sm  px-2 py-1 rounded-md border ">
                                    Planned: <span className="text-indigo-600">100h</span>
                                </span>
                                <span className="text-sm  px-2 py-1 rounded-md border ">
                                    Actual: <span className="text-green-600">90h</span>
                                </span>
                                <span className="text-sm  px-2 py-1 rounded-md border ">
                                    Variance: <span className="text-green-600">+10h</span>
                                </span>
                            </div>
                        </div>
                    </AccordionTrigger>
                    <hr className="border" />

                    {/* CONTENT */}
                    <AccordionContent className="px-2 pb-2 py-2 overflow-hidden">
                        <div className="w-full px-4 py-2">
                            <div className="flex justify-between mb-2">
                                <span>Overall progress</span>
                                <span className="ml-auto">90h / 100h</span>
                            </div>
                            <Progress value={90} />
                        </div>
                        <div className="w-full px-4 py-2 mt-2">
                            <DataTableLayout
                                data={projectData}
                                columns={projectColumns}
                                totalPages={1}
                            />
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </div>
        </Accordion>
    );
}

export default ProjectMemberView;