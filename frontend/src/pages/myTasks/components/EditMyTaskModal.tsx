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

/* ================= SCHEMA ================= */

const taskSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    type: z.string().min(1, "Type is required"),
    priority: z.string().min(1, "Priority is required"),
    status: z.string().min(1, "Status is required"),
    estimatedHours: z.coerce.number().min(0.5, "Minimum 0.5 hours"),
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
    const form = useForm<TaskFormValues>({
        resolver: zodResolver(taskSchema),
        defaultValues: {
            title: "",
            description: "",
            type: "task",
            priority: "medium",
            status: "todo",
            estimatedHours: 0,
            assignee: "john",
        },
    });

    /* Prefill form when task changes */
    useEffect(() => {
        if (task) {
            console.log(task.estimatedHours);
            form.reset({
                title: task.name,
                description: task.description || "",
                priority: task.priority.toLowerCase(),
                status: task.status === "Todo" ? "todo" : task.status === "In progress" ? "in_progress" : task.status.toLowerCase(),
                type: task.type === "Task" ? "task" : task.type === "Bug" ? "bug" : task.type.toLowerCase(),
                estimatedHours: task.estimatedHours !== undefined && task.estimatedHours !== null ? task.estimatedHours : 0.5,
                assignee: task.assignee || "john",
            });
        }
    }, [task, form]);

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
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle className="flex justify-center font-bold text-2xl">
                        Edit Task
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmitForm)}
                        className="space-y-4"
                    >
                        {/* Title */}
                        <FormField
                            control={form.control}
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
                            control={form.control}
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
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
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
                                control={form.control}
                                name="priority"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Priority</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
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
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
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
                                control={form.control}
                                name="estimatedHours"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Estimated Hours</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.5"
                                                min="0"
                                                {...field}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    field.onChange(
                                                    value === "" ? undefined : Number(value)
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
                            control={form.control}
                            name="assignee"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Assignee</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="john">John</SelectItem>
                                            <SelectItem value="bob">Bob</SelectItem>
                                            <SelectItem value="alice">Alice</SelectItem>
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