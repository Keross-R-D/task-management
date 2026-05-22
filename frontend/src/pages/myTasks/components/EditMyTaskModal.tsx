import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    Button,
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
    Input,
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
    Textarea,
} from "ikon-react-components-lib";
import { useUserMap } from "@/utils/userMap";

/* ================= SCHEMA ================= */

const taskSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    type: z.string().min(1, "Type is required"),
    priority: z.string().min(1, "Priority is required"),
    status: z.string().min(1, "Status is required"),
    estimatedHours: z.number().min(0.5, "Minimum 0.5 hours"),
    assignee: z.string().min(1, "Assignee is required"),
});

export type TaskFormValues = z.infer<typeof taskSchema>;

/* ================= TYPES ================= */

interface Task {
    id: string;
    name: string;
    status: "Todo" | "In progress" | "Done" | "Blocked";
    priority: "Low" | "Medium" | "High";
    type: "Task" | "Bug" | "Improvement",
    estimatedHours?: number;
    assignee?: string;
    description?: string;
}

interface Props {
    open: boolean;
    task: Task | null;
    onClose: () => void;
    onSubmit: (data: TaskFormValues) => void;
    isLoading?: boolean;
}

/* ================= COMPONENT ================= */

export default function EditMyTaskModal({
    open,
    task,
    onClose,
    onSubmit,
    isLoading,
}: Props) {
    const { allUsers } = useUserMap();
    const form = useForm<TaskFormValues>({
        resolver: zodResolver(taskSchema) as any,
        defaultValues: {
            title: "",
            description: "",
            type: "task",
            priority: "medium",
            status: "todo",
            estimatedHours: 0,
            assignee: "",
        },
    });

    /* Prefill form when task changes */
    useEffect(() => {
        if (task) {
            console.log(task.assignee);
            form.reset({
                title: task.name,
                description: task.description || "",
                priority: task.priority.toLowerCase(),
                status: task.status === "Todo" ? "todo" : task.status === "In progress" ? "in_progress" : task.status.toLowerCase(),
                type: task.type === "Task" ? "task" : task.type === "Bug" ? "bug" : task.type.toLowerCase(),
                estimatedHours: task.estimatedHours !== undefined && task.estimatedHours !== null ? task.estimatedHours : 0.5,
                assignee: allUsers.find(
                    (user) => user.name === task.assignee
                )?.id || "",
            });
        }
    }, [task, form, allUsers]);

    const handleClose = () => {
        form.reset();
        onClose();
    };

    const handleSubmitForm = (data: TaskFormValues) => {
        onSubmit(data);
        form.reset();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-xl" onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle className="flex justify-center font-bold text-2xl">
                        Edit Task
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmitForm as any)}
                        className="space-y-4"
                    >
                        {/* Title */}
                        <FormField
                            control={form.control as any}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Title <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter task title" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Description */}
                        <FormField
                            control={form.control as any}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Describe the task" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Type + Priority */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control as any}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type <span className="text-red-500">*</span></FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent position="popper">
                                                <SelectItem value="task">Task</SelectItem>
                                                <SelectItem value="bug">Bug</SelectItem>
                                                <SelectItem value="improvement">
                                                    Improvement
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control as any}
                                name="priority"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Priority <span className="text-red-500">*</span></FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent position="popper">
                                                <SelectItem value="low">Low</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                                <SelectItem value="high">High</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Status + Hours */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control as any}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status <span className="text-red-500">*</span></FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent position="popper">
                                                <SelectItem value="todo">To Do</SelectItem>
                                                <SelectItem value="in_progress">
                                                    In Progress
                                                </SelectItem>
                                                <SelectItem value="done">Done</SelectItem>
                                                <SelectItem value="blocked">Blocked</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control as any}
                                name="estimatedHours"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Estimated Hours <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.5"
                                                min="0"
                                                {...field}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    field.onChange(
                                                    value === "" ? 0 : Number(value)
                                                    );
                                                }}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Assignee */}
                        <FormField
                            control={form.control as any}
                            name="assignee"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Assignee <span className="text-red-500">*</span></FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent position="popper">
                                            {allUsers.map((user) => (
                                                <SelectItem key={user.id} value={user.id}>
                                                    {user.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="secondary" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Updating..." : "Update Task"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}