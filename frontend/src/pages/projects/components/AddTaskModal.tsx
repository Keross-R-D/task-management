import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateTaskMutation, useUpdateTaskMutation } from "@/features/tasks/tasksApiSlice";
import React, { useEffect } from "react";
import type { Task } from "@/features/tasks/tasksApiSlice";
import { TaskEnum } from "@/enums/task.constants";

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

const baseTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(4, "Description is required"),

  type: z.string().min(1, "Type is required"),
  status: z.string().min(1, "Status is required"),
  priority: z.string().min(1, "Priority is required"),

  assigneeId: z.string().min(1, "Assignee is required"),
  reporterId: z.string().min(1, "Reporter is required"),

  estimatedHours: z.number().min(1, "Must be greater than 0"),

  plannedDuration: z.number().min(1, "Must be greater than 0"),

  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
});

export type TaskFormValues = z.infer<typeof baseTaskSchema>;

interface Props {
  open: boolean;
  projectId: string;
  epicId?: string | null;
  sprintId?: string | null;
  task?: Task | null;
  sprintStartDate?: string;
  sprintEndDate?: string;
  onClose: () => void;
}

export default function AddTaskModal({
  open,
  projectId,
  epicId,
  sprintId,
  task,
  sprintStartDate,
  sprintEndDate,
  onClose,
}: Props) {
  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
  
  const isLoading = isCreating || isUpdating;

  const dynamicSchema = React.useMemo(() => {
    return baseTaskSchema.superRefine((data, ctx) => {
      if (data.startDate && data.endDate && new Date(data.startDate) > new Date(data.endDate)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Start Date must not be later than End Date", path: ["startDate"] });
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "End Date must not be earlier than Start Date", path: ["endDate"] });
      }
      if (sprintStartDate && data.startDate && new Date(data.startDate) < new Date(sprintStartDate)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Cannot be earlier than Sprint start date (${sprintStartDate})`, path: ["startDate"] });
      }
      if (sprintEndDate && data.endDate && new Date(data.endDate) > new Date(sprintEndDate)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Cannot be later than Sprint end date (${sprintEndDate})`, path: ["endDate"] });
      }
    });
  }, [sprintStartDate, sprintEndDate]);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(dynamicSchema),
    defaultValues: {
      title: "",
      description: "",
      type: TaskEnum.Type.TASK,
      status: TaskEnum.Status.TODO,
      priority: TaskEnum.Priority.MEDIUM,
      assigneeId: "",
      reporterId: "",
      estimatedHours: undefined,
      plannedDuration: undefined,
      startDate: "",
      endDate: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (task) {
        form.reset({
          title: task.title || "",
          description: task.description || "",
          type: task.type || "",
          status: task.status || "",
          priority: task.priority || "",
          assigneeId: task.assigneeId || "",
          reporterId: task.reporterId || "",
          estimatedHours: task.estimatedHours || undefined,
          plannedDuration: task.plannedDuration || undefined,
          startDate: task.startDate
            ? new Date(task.startDate).toISOString().split("T")[0]
            : "",
          endDate: task.endDate
            ? new Date(task.endDate).toISOString().split("T")[0]
            : "",
        });
      } else {
        form.reset({
          title: "",
          description: "",
          type: "",
          status: "",
          priority: "",
          assigneeId: "",
          reporterId: "",
          estimatedHours: undefined,
          plannedDuration: undefined,
          startDate: "",
          endDate: "",
        });
      }
    }
  }, [task, open, form]);

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const handleCreateOrUpdate = async (data: TaskFormValues) => {
    try {
      if (task && task.id) {
        await updateTask({
          id: task.id,
          ...data,
          projectId: task.projectId || projectId,
          epicId: epicId || task.epicId || null,
          sprintId: sprintId || task.sprintId || null,
        }).unwrap();
      } else {
        await createTask({
          ...data,
          projectId,
          epicId: epicId || null,
          sprintId: sprintId || null,
        }).unwrap();
      }
      form.reset();
      onClose();
    } catch (err) {
      console.error("Failed to save task:", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Add Task"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleCreateOrUpdate)}
            className="space-y-4 max-h-[70vh] overflow-y-auto pr-2"
          >
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
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
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Type | Priority | Status */}
            <div className="grid grid-cols-3 gap-4">
              {/* Type */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(TaskEnum.Type).map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Priority */}
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(TaskEnum.Priority).map((priority) => (
                          <SelectItem key={priority} value={priority}>
                            {priority}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(TaskEnum.Status).map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Assignee + Reporter */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="assigneeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assignee ID</FormLabel>
                    <FormControl>
                      <Input placeholder="UUID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reporterId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reporter ID</FormLabel>
                    <FormControl>
                      <Input placeholder="UUID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Numbers */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="estimatedHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Hours</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? undefined
                              : e.target.valueAsNumber,
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="plannedDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Planned Duration</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? undefined
                              : e.target.valueAsNumber,
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : task ? "Update Task" : "Add Task"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
