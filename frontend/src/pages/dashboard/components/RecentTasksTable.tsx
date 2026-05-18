import type { Task } from "@/pages/myTasks/MyTaskPage";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "ikon-react-components-lib";

interface Props {
    tasks: Task[];
    isLoading?: boolean;
}

export default function RecentTasksTable({
    tasks,
    isLoading,
}: Props) {
    if (isLoading) {
        return (
            <div className="p-6 text-muted-foreground">
                Loading tasks...
            </div>
        );
    }

    return (
        <div className="rounded-xl border overflow-hidden">
            <Table className="w-full">
                <TableHeader className="bg-muted/50">
                    <TableRow>
                        <TableHead className="text-left p-4">Task</TableHead>
                        <TableHead className="text-left p-4">Status</TableHead>
                        <TableHead className="text-left p-4">Priority</TableHead>
                        <TableHead className="text-left p-4">Assignee</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {tasks.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={2} className="text-center py-4">
                                No data available
                            </TableCell>
                        </TableRow>
                        ) : (
                        tasks.map((task) => {
                            const statusStyles: Record<string, string> = {
                                Todo: "bg-blue-500/10 text-blue-500",
                                "In progress":
                                    "bg-yellow-500/10 text-yellow-500",
                                Done: "bg-green-500/10 text-green-500",
                                Blocked: "bg-red-500/10 text-red-500",
                            };

                            const priorityStyles: Record<string, string> = {
                                Low: "text-green-500",
                                Medium: "text-yellow-500",
                                High: "text-red-500",
                            };

                            const assignee = task.assignee
                                .split(" ")
                                .map(
                                    (word) =>
                                        word.charAt(0).toUpperCase() +
                                        word.slice(1).toLowerCase()
                                )
                                .join(" ");

                            return (
                                <TableRow
                                    key={task.id}
                                    className="border-t hover:bg-muted/30 transition-colors"
                                >
                                    <TableCell className="p-4 font-medium">
                                        {task.name}
                                    </TableCell>

                                    <TableCell className="p-4">
                                        <span
                                            className={`px-2 py-1 rounded-md text-sm font-medium ${statusStyles[task.status]}`}
                                        >
                                            {task.status}
                                        </span>
                                    </TableCell>

                                    <TableCell className="p-4">
                                        <span
                                            className={`font-semibold ${priorityStyles[task.priority]}`}
                                        >
                                            {task.priority}
                                        </span>
                                    </TableCell>

                                    <TableCell className="p-4">
                                        <span className="flex gap-1 items-center font-semibold bg-muted w-fit rounded-md px-1.5 py-1">
                                            {assignee}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            );
                            })
                        )}
                </TableBody>
            </Table>
        </div>
    );
}