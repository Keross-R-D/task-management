import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
    DataTableLayout,
    Progress,
} from "ikon-react-components-lib";
import { ChevronRight, Dot } from "lucide-react";
import { useMemo } from "react";
import type { Project } from "@/features/projects/projectsApiSlice";
import type { Task } from "@/features/tasks/tasksApiSlice";

// ── Types ──

type ProjectMember = {
    id: string;
    name: string;
    email: string;
    tasks: number;
    completed: number;
    planned: number;
    actual: number;
};

interface Props {
    projects: Project[];
    allTasks: Task[];
    getUserInfo: any;
}

// ── Columns ──

const projectColumns: any = [
    {
        accessorKey: "name",
        header: () => <div className="font-semibold">Team Member</div>,
        cell: ({ row }: { row: { original: ProjectMember } }) => {
            const user = row.original;
            return (
                <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
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
        header: () => <div className="font-semibold">Planned vs Actual</div>,
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
    },
];

// ── Component ──

export default function ProjectMemberView({ projects, allTasks, getUserInfo }: Props) {
    // Compute per-project data
    const projectsData = useMemo(() => {
        return projects.map((project) => {
            const projectTasks = allTasks.filter(
                (t) => String(t.projectId) === String(project.id)
            );

            // Group by assignee
            const byAssignee: Record<
                string,
                { tasks: number; completed: number; planned: number; actual: number }
            > = {};

            projectTasks.forEach((task) => {
                const key = task.assigneeId || "unassigned";
                if (!byAssignee[key]) {
                    byAssignee[key] = { tasks: 0, completed: 0, planned: 0, actual: 0 };
                }
                byAssignee[key].tasks += 1;
                if (
                    task.status?.toUpperCase() === "DONE" ||
                    task.status?.toUpperCase() === "COMPLETED"
                ) {
                    byAssignee[key].completed += 1;
                }
                byAssignee[key].planned += task.estimatedHours || 0;
                byAssignee[key].actual += task.actualHours || 0;
            });

            const members: ProjectMember[] = Object.entries(byAssignee)
                .filter(([key]) => key !== "unassigned")
                .map(([userId, data]) => {
                    const user = getUserInfo(userId);
                    return {
                        id: userId,
                        name: user.name,
                        email: user.email,
                        tasks: data.tasks,
                        completed: data.completed,
                        planned: Math.round(data.planned * 10) / 10,
                        actual: Math.round(data.actual * 10) / 10,
                    };
                });

            const totalPlanned = members.reduce((s, m) => s + m.planned, 0);
            const totalActual = members.reduce((s, m) => s + m.actual, 0);
            const totalTasks = projectTasks.length;
            const completedTasks = projectTasks.filter(
                (t) =>
                    t.status?.toUpperCase() === "DONE" ||
                    t.status?.toUpperCase() === "COMPLETED"
            ).length;
            const completionPct =
                totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
            const variance = Math.round((totalPlanned - totalActual) * 10) / 10;

            return {
                project,
                members,
                totalPlanned: Math.round(totalPlanned * 10) / 10,
                totalActual: Math.round(totalActual * 10) / 10,
                totalTasks,
                completionPct,
                variance,
                uniqueMembers: members.length,
            };
        });
    }, [projects, allTasks]);

    if (projectsData.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                No projects found. Create a project and assign tasks to see resource
                utilisation.
            </div>
        );
    }

    return (
        <Accordion type="single" collapsible className="w-full space-y-3">
            {projectsData.map(
                ({
                    project,
                    members,
                    totalPlanned,
                    totalActual,
                    totalTasks,
                    completionPct,
                    variance,
                    uniqueMembers,
                }) => (
                    <div key={project.id} className="border rounded-xl">
                        <AccordionItem
                            value={`project-${project.id}`}
                            className="rounded-xl overflow-hidden"
                        >
                            {/* PROJECT HEADER */}
                            <AccordionTrigger className="group hover:no-underline px-3 py-3 [&[data-state]>svg]:hidden">
                                <div className="flex items-center justify-between w-full min-w-0 cursor-pointer">
                                    {/* LEFT */}
                                    <div className="flex items-center gap-3 min-w-0">
                                        <ChevronRight className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-90 shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-lg font-semibold truncate">
                                                {project.projectName}
                                            </p>
                                            <p className="flex text-sm text-gray-400 truncate">
                                                {totalTasks} tasks
                                                <Dot />
                                                {completionPct}% Complete
                                                <Dot />
                                                {uniqueMembers} Members
                                            </p>
                                        </div>
                                    </div>

                                    {/* RIGHT */}
                                    <div className="flex items-center gap-3 shrink-0">
                                        <span className="text-sm px-2 py-1 rounded-md border">
                                            Planned:{" "}
                                            <span className="text-indigo-600">{totalPlanned}h</span>
                                        </span>
                                        <span className="text-sm px-2 py-1 rounded-md border">
                                            Actual:{" "}
                                            <span className="text-green-600">{totalActual}h</span>
                                        </span>
                                        <span className="text-sm px-2 py-1 rounded-md border">
                                            Variance:{" "}
                                            <span
                                                className={
                                                    variance >= 0 ? "text-green-600" : "text-red-600"
                                                }
                                            >
                                                {variance >= 0 ? "+" : ""}
                                                {variance}h
                                            </span>
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
                                        <span className="ml-auto">
                                            {totalActual}h / {totalPlanned}h
                                        </span>
                                    </div>
                                    <Progress
                                        value={
                                            totalPlanned > 0
                                                ? Math.min(
                                                    100,
                                                    Math.round((totalActual / totalPlanned) * 100)
                                                )
                                                : 0
                                        }
                                    />
                                </div>
                                <div className="w-full px-4 py-2 mt-2">
                                    {members.length === 0 ? (
                                        <div className="text-center py-4 text-muted-foreground text-sm">
                                            No assigned members in this project
                                        </div>
                                    ) : (
                                        <DataTableLayout
                                            data={members}
                                            columns={projectColumns}
                                            extraTools={{ totalPages: 1 }}
                                        />
                                    )}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </div>
                )
            )}
        </Accordion>
    );
}
