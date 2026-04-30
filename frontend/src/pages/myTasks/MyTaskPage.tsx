import { DataTableLayout, Button, LoadingSpinner, Separator } from "ikon-react-components-lib";
import { toast } from "sonner";
import React, { useState, useEffect } from "react";
import { useGetMyTasksQuery, useUpdateMyTaskMutation, useUpdateMyTaskStatusMutation, useDeleteMyTaskMutation, useCreateMyTaskMutation } from "@/features/myTasks/mytasksApiSlice";
import AddMyTaskModal from "./components/AddMyTaskModal";
import StatsCard from "./components/StatsCard";
import MyTaskLogTimeModal from "./components/MyTaskLogTimeModal";
import ViewMyTaskTimeLogsModal from "./components/ViewMyTaskTimeLogsModal";
import { userMap } from "@/features/myTasks/mytasksApiSlice";

import { Plus, NotepadText, ListTodo, LoaderCircle, SquareCheckBig, Trash2, MoreHorizontal, Ban, ArrowDown, ArrowUp, Flame, CheckCircle2, Clock, Pencil, CircleUser, Timer, History } from "lucide-react";
import EditMyTaskModal from "./components/EditMyTaskModal";

// TYPES
export type Task = {
    id: string;
    name: string;
    estimatedHours: number,
    status: "Todo" | "In progress" | "Done" | "Blocked";
    priority: "Low" | "Medium" | "High";
    type: "Task" | "Bug" | "Improvement",
    assignee: string
};

type CreateTaskPayload = {
    title: string;
    description?: string;
    type: string;
    priority: string;
    status: string;
    estimatedHours: number;
    assignee: string;
};

//formatting status
const formatStatus = (status: string): Task["status"] => {
    switch (status) {
        case "TO_DO":
            return "Todo";
        case "IN_PROGRESS":
            return "In progress";
        case "DONE":
            return "Done";
        case "BLOCKED":
            return "Blocked";
        default:
            return "Todo";
    }
};

//formatting priority
const formatPriority = (priority: string): Task["priority"] => {
    switch (priority) {
        case "LOW":
            return "Low";
        case "MEDIUM":
            return "Medium";
        case "HIGH":
            return "High";
        default:
            return "Low";
    }
};

//formatting status
const formatType = (type: string): Task["type"] => {
    switch (type) {
        case "TASK":
            return "Task";
        case "BUG":
            return "Bug";
        case "IMPROVEMENT":
            return "Improvement";
        default:
            return "Task";
    }
};

const reverseUserMap: Record<string, string> = Object.fromEntries(
    Object.entries(userMap).map(([key, value]) => [value, key])
);

const reverseStatusMap: Record<string, string> = {
    "Todo": "TO_DO",
    "In progress": "IN_PROGRESS",
    "Done": "DONE",
    "Blocked": "BLOCKED",
};

const reversePriorityMap: Record<string, string> = {
    "Low": "LOW",
    "Medium": "MEDIUM",
    "High": "HIGH",
};

const reverseTypeMap: Record<string, string> = {
    "Task": "TASK",
    "Bug": "BUG",
    "Improvement": "IMPROVEMENT",
};

//Map assignee
const mapAssignee = (id?: string) => {
    if (!id) return "";
    return reverseUserMap[id] || "";
};

//Task Page component
const TasksPage: React.FC = () => {
    const [openRowId, setOpenRowId] = useState<string | null>(null);
    const [editTask, setEditTask] = useState<Task | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    // const [page, setPage] = useState(0);
    // const [pageSize, setPageSize] = useState(10);
    // const { data, isLoading, isError } = useGetTasksQuery({ page, size: pageSize });
    const [ logTask, setLogTask ] = useState<Task | null>(null);
    const [ isLogOpen, setIsLogOpen ] = useState(false);
    const [ viewTask, setViewTask ] = useState<Task | null>(null);
    const [ isViewOpen, setIsViewOpen ] = useState(false);
    const { data, isLoading, isError } = useGetMyTasksQuery();
    const [updateTask] = useUpdateMyTaskMutation();
    const [createTask] = useCreateMyTaskMutation();
    const [updateTaskStatus, { isLoading: isUpdating }] = useUpdateMyTaskStatusMutation();
    const [deleteTask, { isLoading: isDeleting }] = useDeleteMyTaskMutation();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const handleClickOutside = () => setOpenRowId(null);
        window.addEventListener("click", handleClickOutside);
        return () => window.removeEventListener("click", handleClickOutside);
    }, []);

    const handleCreate = async (data: CreateTaskPayload) => {
        try {
            await createTask(data).unwrap();
            toast.success("Task created successfully!");
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (taskId: string) => {
        //if (!window.confirm("Are you sure you want to delete this task?")) return;
        try {
            await deleteTask(taskId).unwrap();
            toast.success("Task deleted successfully!");
        } catch (err) {
            console.error("Failed to delete task", err);
        }
        setOpenRowId(null);
    };

    const handleUpdate = async (id: string, formData: CreateTaskPayload) => {
        try {
            await updateTask({ id, data: formData }).unwrap();
            toast.success("Task updated successfully!");
        } catch (err) {
            console.error(err);
        }
    };

    const handleStatusChange = async (taskId: string, status: string) => {
        try {
            await updateTaskStatus({ id: taskId, status }).unwrap();
            toast.success("Task status updated successfully!");
        } catch (err) {
            console.error("Failed to update status", err);
        }
        setOpenRowId(null);
    };

    const tasks = data?.content?.map((task) => ({
        id: task.id,
        name: task.taskTitle,
        status: formatStatus(task.taskStatus),
        estimatedHours: task.estimatedHours,
        priority: formatPriority(task.taskPriority),
        type: formatType(task.taskType),
        assignee: mapAssignee(task.assigneeId)
    })) || [];

    const total = tasks.length;

    const todo = tasks.filter(t => t.status === "Todo").length;

    const inProgress = tasks.filter(t => t.status === "In progress").length;

    const done = tasks.filter(t => t.status === "Done").length;

    // DataTable columns
    const columns: any = [
        {
            accessorKey: "name",
            header: () => (
                <div className="text-left font-semibold">Task Name</div>
            ),
            cell: ({ row }: { row: { original: Task } }) => (
                <span className="font-medium">{row.original.name}</span>
            ),
        },

        {
            accessorKey: "status",
            header: () => (
                <div className="text-left font-semibold">Status</div>
            ),
            cell: ({ row }: { row: { original: Task } }) => {
                const status = row.original.status;

                const styles: Record<Task["status"], string> = {
                    Todo: "bg-blue-500/10 text-blue-500",
                    "In progress": "bg-yellow-500/10 text-yellow-500",
                    Done: "bg-green-500/10 text-green-500",
                    Blocked: "bg-red-500/10 text-red-500",
                };

                return (
                    <span
                        className={`px-2 py-1 rounded-md text-sm font-medium ${styles[status]}`}
                    >
                        {status}
                    </span>
                );
            },
        },

        {
            accessorKey: "priority",
            header: () => (
                <div className="text-left font-semibold">Priority</div>
            ),
            cell: ({ row }: { row: { original: Task } }) => {
                const priority = row.original.priority;

                const styles: Record<Task["priority"], string> = {
                    Low: "text-green-500",
                    Medium: "text-yellow-500",
                    High: "text-red-500",
                };

                return (
                    <span className={`font-semibold ${styles[priority]}`}>
                        {priority}
                    </span>
                );
            },
        },

        {
            accessorKey: "assignee",
            header: "Assignee",
            cell: ({ row }: { row: { original: Task } }) => {
                const assignee = row.original.assignee.split(' ')
                    .map(word =>
                        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                    )
                    .join(' ');

                return (
                    <span className="flex gap-1 items-center font-semibold bg-muted w-fit rounded-md px-1.5 py-1">
                        {assignee}
                    </span>
                );
            },
        },

        {
            id: "actions",
            header: () => (
                <div className="text-left font-semibold">Actions</div>
            ),
            cell: ({ row }: { row: { original: Task } }) => {
                const task = row.original;
                const isOpen = openRowId === task.id;

                return (
                    <div className="relative">
                        {/* Button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setOpenRowId(isOpen ? null : task.id);
                            }}
                            className="p-1 rounded"
                        >
                            <MoreHorizontal className="h-4 w-4" />
                        </button>

                        {/* Dropdown */}
                        {isOpen && (
                            <div className="absolute right-0 mt-2 p-1 w-44 border rounded-lg shadow-md z-50 bg-background">

                                <button
                                    onClick={() => {
                                        setEditTask(task);
                                        setIsEditOpen(true);
                                    }}
                                    className="flex items-center gap-2 rounded-md hover:bg-muted w-full px-3 py-2"
                                >
                                    <Pencil className="h-4 w-4" /> Edit
                                </button>

                                <button
                                    onClick={() => {
                                        setLogTask(task);
                                        setIsLogOpen(true);
                                        setOpenRowId(null);
                                    }}
                                    className="flex items-center gap-2 rounded-md hover:bg-muted w-full px-3 py-2"
                                >
                                    <Timer className="h-4 w-4" />
                                    Log Time
                                </button>

                                <button
                                    onClick={() => {
                                        setViewTask(task);
                                        setIsViewOpen(true);
                                        setOpenRowId(null);
                                    }}
                                    className="flex items-center gap-2 rounded-md hover:bg-muted w-full px-3 py-2"
                                >
                                    <History className="h-4 w-4" />
                                    View Logs
                                </button>

                                <Separator className="my-1"/>

                                <button
                                    onClick={() => handleStatusChange(task.id, "TO_DO")}
                                    disabled={isUpdating}
                                    className="flex items-center gap-2 rounded-md hover:bg-muted w-full px-3 py-2"
                                >
                                    <ListTodo className="h-4 w-4" /> Set To Do
                                </button>

                                <button
                                    onClick={() => handleStatusChange(task.id, "IN_PROGRESS")}
                                    disabled={isUpdating}
                                    className="flex items-center gap-2 rounded-md hover:bg-muted w-full px-3 py-2"
                                >
                                    <LoaderCircle className="h-4 w-4" /> Set In Progress
                                </button>

                                <button
                                    onClick={() => handleStatusChange(task.id, "DONE")}
                                    disabled={isUpdating}
                                    className="flex items-center gap-2 rounded-md hover:bg-muted w-full px-3 py-2"
                                >
                                    <SquareCheckBig className="h-4 w-4" /> Set Done
                                </button>

                                <button
                                    onClick={() => handleStatusChange(task.id, "BLOCKED")}
                                    disabled={isUpdating}
                                    className="flex items-center gap-2 rounded-md hover:bg-muted w-full px-3 py-2"
                                >
                                    <Ban className="h-4 w-4" /> Set Blocked
                                </button>

                                <Separator className="my-1"/>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();

                                        toast.error("Delete this task?", {
                                            description: "This action cannot be undone.",

                                            action: {
                                                label: "Delete",
                                                onClick: () => handleDelete(task.id),
                                            },

                                            cancel: {
                                                label: "Cancel",
                                                onClick: () => { }, // optional
                                            },

                                            className: "border border-red-500/30",
                                            actionButtonStyle: {
                                                backgroundColor: "#dc2626",
                                                color: "white",
                                            },
                                            cancelButtonStyle: {
                                                backgroundColor: "#374151",
                                                color: "white",
                                            },
                                        });
                                        setOpenRowId(null);
                                    }}
                                    disabled={isDeleting}
                                    className="flex items-center gap-2 rounded-md hover:bg-red-600/12 w-full px-3 py-2 text-red-500"
                                >
                                    <Trash2 className="h-4 w-4" /> Delete
                                </button>

                            </div>
                        )}
                    </div>
                );
            },
        }
    ];

    //For Grid view
    const renderGrid = (data: Task[]) => {
        const statusIcons: Record<Task["status"], React.ReactNode> = {
            Todo: <ListTodo className="h-3.5 w-3.5" />,
            "In progress": <Clock className="h-3.5 w-3.5" />,
            Done: <CheckCircle2 className="h-3.5 w-3.5" />,
            Blocked: <Ban className="h-3.5 w-3.5" />,
        };

        const priorityIcons: Record<Task["priority"], React.ReactNode> = {
            Low: <ArrowDown className="h-4 w-4" />,
            Medium: <ArrowUp className="h-4 w-4" />,
            High: <Flame className="h-4 w-4" />,
        };

        const statusStyles: Record<Task["status"], string> = {
            Todo: "text-indigo-500",
            "In progress": "text-yellow-500",
            Done: "text-green-500",
            Blocked: "text-red-500",
        };

        const statusBorderStyles: Record<Task["status"], string> = {
            Todo: "border-t-indigo-500",
            "In progress": "border-t-yellow-500",
            Done: "border-t-green-500",
            Blocked: "border-t-red-500",
        };

        const priorityStyles: Record<Task["priority"], string> = {
            Low: "bg-green-500/10 text-green-500",
            Medium: "bg-yellow-500/10 text-yellow-500",
            High: "bg-red-500/10 text-red-500",
        };

        return (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {data.map((task) => {
                    const isOpen = openRowId === task.id;

                    return (
                        <div
                            key={task.id}
                            className={`p-5 border rounded-xl shadow-muted bg-muted/30 relative border-t-2 ${statusBorderStyles[task.status]}`}
                        >
                            <div className="absolute top-4 right-4">
                                <div className="relative">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenRowId(isOpen ? null : task.id);
                                        }}
                                        className="p-1 rounded hover:bg-muted"
                                    >
                                        <MoreHorizontal className="h-4 w-4" />
                                    </button>

                                    {/* DROPDOWN */}
                                    {isOpen && (
                                        <div className="absolute right-0 mt-2 p-1 w-44 border rounded-lg shadow-md z-50 bg-background">

                                            <button
                                                onClick={() => {
                                                    setEditTask(task);
                                                    setIsEditOpen(true);
                                                }}
                                                className="flex items-center gap-2 rounded-md hover:bg-muted w-full px-3 py-2"
                                            >
                                                <Pencil className="h-4 w-4" /> Edit
                                            </button>

                                            <button
                                                onClick={() => {
                                                    setLogTask(task);
                                                    setIsLogOpen(true);
                                                    setOpenRowId(null);
                                                }}
                                                className="flex items-center gap-2 rounded-md hover:bg-muted w-full px-3 py-2"
                                            >
                                                <Timer className="h-4 w-4" />
                                                Log Time
                                            </button>

                                            <button
                                                onClick={() => {
                                                    setViewTask(task);
                                                    setIsViewOpen(true);
                                                    setOpenRowId(null);
                                                }}
                                                className="flex items-center gap-2 rounded-md hover:bg-muted w-full px-3 py-2"
                                            >
                                                <History className="h-4 w-4" />
                                                View Logs
                                            </button>

                                            <Separator className="my-1"/>

                                            <button
                                                onClick={() => handleStatusChange(task.id, "TO_DO")}
                                                className="flex items-center gap-2 rounded-md hover:bg-muted w-full px-3 py-2"
                                            >
                                                <ListTodo className="h-5 w-5" /> Set To Do
                                            </button>

                                            <button
                                                onClick={() => handleStatusChange(task.id, "IN_PROGRESS")}
                                                className="flex items-center gap-2 rounded-md hover:bg-muted w-full px-3 py-2"
                                            >
                                                <LoaderCircle className="h-4 w-4" /> Set In Progress
                                            </button>

                                            <button
                                                onClick={() => handleStatusChange(task.id, "DONE")}
                                                className="flex items-center gap-2 rounded-md hover:bg-muted w-full px-3 py-2"
                                            >
                                                <SquareCheckBig className="h-4 w-4" /> Set Done
                                            </button>

                                            <button
                                                onClick={() => handleStatusChange(task.id, "BLOCKED")}
                                                className="flex items-center gap-2 rounded-md hover:bg-muted w-full px-3 py-2"
                                            >
                                                <Ban className="h-4 w-4" /> Set Blocked
                                            </button>

                                            <Separator className="my-1"/>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();

                                                    toast.error("Delete this task?", {
                                                        description: "This action cannot be undone.",

                                                        action: {
                                                            label: "Delete",
                                                            onClick: () => handleDelete(task.id),
                                                        },

                                                        cancel: {
                                                            label: "Cancel",
                                                            onClick: () => { },
                                                        },

                                                        className: "border border-red-500/30",
                                                        actionButtonStyle: {
                                                            backgroundColor: "#dc2626",
                                                            color: "white",
                                                        },
                                                        cancelButtonStyle: {
                                                            backgroundColor: "#374151",
                                                            color: "white",
                                                        },
                                                    });
                                                    setOpenRowId(null);
                                                }}
                                                className="flex items-center gap-2 rounded-md hover:bg-red-600/12 w-full px-3 py-2 text-red-500"
                                            >
                                                <Trash2 className="h-4 w-4" /> Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* CONTENT */}
                            <div className="flex flex-col gap-1">
                                <h3 className="flex gap-1 font-semibold text-lg">{task.name}</h3>

                                <span
                                    className={`flex gap-1 items-center text-sm font-semibold mb-2 ${statusStyles[task.status]}`}
                                >
                                    {statusIcons[task.status]}
                                    {task.status}
                                </span>

                                <span
                                    className={`flex gap-1 items-center px-2 py-1 mt-1 rounded-md text-sm font-medium w-fit ${priorityStyles[task.priority]}`}
                                >
                                    {priorityIcons[task.priority]}
                                    {task.priority}
                                </span>

                                <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                                    <CircleUser className="h-3 w-3" />Assigned to: <span className="font-medium">{task.assignee.split(' ')
                                    .map(word =>
                                        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                                    )
                                    .join(' ') || "Unassigned"}</span>
                                </div>
                            </div>
                        </div>
                    )
                }
                )
                }
            </div>
        );
    };

    if (isLoading) {
        return (
            <LoadingSpinner className="size-8" />
        );
    }

    if (isError) {
        return (
            <div className="p-4 bg-red-100 text-red-700 rounded-md">
                Failed to fetch tasks. Please try again.
            </div>
        );
    }

    return (
        <div className="p-4">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">My Tasks</h1>
                    <p className="text-muted-foreground">Personal tasks not associated with any project.</p>
                </div>
                <Button
                    onClick={() => setOpen(true)}
                >
                    <Plus className="h-4 w-4 mr-2" /> Add Task
                </Button>
            </div>
            <div className="grid mt-5 mb-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatsCard title="Total" description="Total tasks" value={total} color="text-indigo-500" bg="bg-indigo-500/10" Icon={NotepadText} />

                <StatsCard title="To Do" description="Pending tasks" value={todo} color="text-blue-500" bg="bg-blue-500/10" Icon={ListTodo} />

                <StatsCard title="In Progress" description="Ongoing tasks" value={inProgress} color="text-yellow-500" bg="bg-yellow-500/10" Icon={LoaderCircle} />

                <StatsCard title="Done" description="Completed tasks" value={done} color="text-green-500" bg="bg-green-500/10" Icon={SquareCheckBig} />
            </div>

            <div className="w-full">
                <DataTableLayout data={tasks} columns={columns}
                    extraTools={{
                        totalPages: 2,
                        toggleViewMode: true,
                        isLoading: isLoading,
                        gridComponent: renderGrid
                    }}
                />
            </div>

            <AddMyTaskModal
                open={open}
                onClose={() => setOpen(false)}
                onSubmit={(data) => {
                    handleCreate(data);
                    setOpen(false);
                }}
            />

            <EditMyTaskModal
                open={isEditOpen}
                task={editTask}
                onClose={() => {
                    setIsEditOpen(false);
                    setEditTask(null);
                }}
                onSubmit={(data) => {
                    if (editTask) {
                        // console.log(editTask);
                        handleUpdate(editTask.id, data);
                        setEditTask(null);
                        setIsEditOpen(false);
                    }
                }}
            />

            <MyTaskLogTimeModal
                open={isLogOpen}
                task={
                    logTask
                    ? {
                        id: logTask.id,
                        taskTitle: logTask.name,
                        taskDescription: "",
                        taskType: reverseTypeMap[logTask.type],
                        taskPriority: reversePriorityMap[logTask.priority],
                        taskStatus: reverseStatusMap[logTask.status],
                        estimatedHours: logTask.estimatedHours,
                        assigneeId: null,
                        createdAt: "",
                        updatedAt: "",
                        }
                    : null
                }
                onClose={() => {
                    setIsLogOpen(false);
                    setLogTask(null);
                }}
            />

            <ViewMyTaskTimeLogsModal
                open={isViewOpen}
                task={
                    viewTask
                    ? {
                        id: viewTask.id,
                        taskTitle: viewTask.name,
                        taskDescription: "",
                        taskType: reverseTypeMap[viewTask.type],
                        taskPriority: reversePriorityMap[viewTask.priority],
                        taskStatus: reverseStatusMap[viewTask.status],
                        estimatedHours: viewTask.estimatedHours,
                        assigneeId: null,
                        createdAt: "",
                        updatedAt: "",
                        }
                    : null
                }
                onClose={() => {
                    setIsViewOpen(false);
                    setViewTask(null);
                }}
                onLogMoreTime={() => {
                    setIsViewOpen(false);
                    setLogTask(viewTask);
                    setIsLogOpen(true);
                }}
            />
        </div>
    );
};

export default TasksPage;
