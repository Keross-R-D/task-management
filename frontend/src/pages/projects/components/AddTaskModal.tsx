import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateTaskMutation, useUpdateTaskMutation } from "@/features/tasks/tasksApiSlice";
import React, { useEffect } from "react";
import type { Task } from "@/features/tasks/tasksApiSlice";
import { useGetProjectsQuery } from "@/features/projects/projectsApiSlice";
import { useUserMap } from "@/utils/userMap";
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
  FormDateInput,
} from "ikon-react-components-lib";

const baseTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(4, "Description is required"),

  type: z.string().min(1, "Type is required"),
  status: z.string().min(1, "Status is required"),
  priority: z.string().min(1, "Priority is required"),

  assigneeId: z.string().min(1, "Assignee is required"),
  reporterId: z.string().min(1, "Reporter is required"),

  estimatedHours: z.coerce.number({
      error: "Estimated hours is required",
    })
    .min(0.5, "Minimum 0.5 hours"),

  plannedDuration: z.coerce.number({
      error: "Planned duration is required",
    })
    .min(1, "Must be greater than or equals to 1"),

  startDate: z.date({
    error: "Start date is required",
  }),
  endDate: z.date({
    error: "End date is required",
  }),
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
  
  const { data: projects = [] } = useGetProjectsQuery();
  const project = projects.find((p) => p.id === projectId);
  
  const { allUsers, getUserInfo } = useUserMap();
  const teamMembers = React.useMemo(() => {
    if (!project?.teamMemberIds) return [];
    return project.teamMemberIds.map((id) => getUserInfo(id));
  }, [project, getUserInfo]);

  const isLoading = isCreating || isUpdating;

  const normalizeDate = (date: Date) => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  };

  const dynamicSchema = React.useMemo(() => {
    return baseTaskSchema.superRefine((data, ctx) => {

      const taskStart = normalizeDate(data.startDate);
      const taskEnd = normalizeDate(data.endDate);

      const sprintStart = sprintStartDate
        ? normalizeDate(new Date(sprintStartDate))
        : null;

      const sprintEnd = sprintEndDate
        ? normalizeDate(new Date(sprintEndDate))
        : null;

      // Task start must not be after task end
      if (taskStart > taskEnd) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Start Date must not be later than End Date",
          path: ["startDate"],
        });

        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "End Date must not be earlier than Start Date",
          path: ["endDate"],
        });
      }

      // Task cannot start before sprint start
      if (sprintStart && taskStart < sprintStart) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Cannot be earlier than Sprint start date (${sprintStartDate})`,
          path: ["startDate"],
        });
      }

      // Task cannot end after sprint end
      if (sprintEnd && taskEnd > sprintEnd) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Cannot be later than Sprint end date (${sprintEndDate})`,
          path: ["endDate"],
        });
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
      startDate: undefined,
      endDate: undefined,
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
            ? new Date(task.startDate)
            : undefined,
          endDate: task.endDate
            ? new Date(task.endDate)
            : undefined,
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
          startDate: undefined,
          endDate: undefined,
        });
      }
    }
  }, [task, open, form]);

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const formatLocalDate = (date: Date) => {
    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const handleCreateOrUpdate = async (data: TaskFormValues) => {
    try {
      if (task && task.id) {
        await updateTask({
          id: task.id,
          ...data,
          startDate: formatLocalDate(data.startDate),
          endDate: formatLocalDate(data.endDate),
          projectId: task.projectId || projectId,
          epicId: epicId || task.epicId || null,
          sprintId: sprintId || task.sprintId || null,
        }).unwrap();
      } else {
        await createTask({
          ...data,
          startDate: formatLocalDate(data.startDate),
          endDate: formatLocalDate(data.endDate),
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
      <DialogContent className="max-w-2xl" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle><div className="text-xl">{task ? "Edit Task" : "Add Task"}</div>
            <div className="text-muted-foreground text-sm">
              {task
                ? "Update details for the task."
                : "Create a new task"}
            </div>
          </DialogTitle>
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
                  <FormLabel>Title <span className="text-red-500">*</span></FormLabel>
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
                  <FormLabel>Description <span className="text-red-500">*</span></FormLabel>
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
                    <FormLabel>Type <span className="text-red-500">*</span></FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent position="popper">
                        {Object.values(TaskEnum.Type).map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())}
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
                    <FormLabel>Priority <span className="text-red-500">*</span></FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent position="popper">
                        {Object.values(TaskEnum.Priority).map((priority) => (
                          <SelectItem key={priority} value={priority}>
                            {priority.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())}
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
                    <FormLabel>Status <span className="text-red-500">*</span></FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent position="popper">
                        {Object.values(TaskEnum.Status).map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="assigneeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assignee <span className="text-red-500">*</span></FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Assignee" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent position="popper">
                        {teamMembers.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reporterId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reporter <span className="text-red-500">*</span></FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Reporter" />
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <FormDateInput
                formControl={form.control}
                name="startDate"
                label={
                  <>
                    Start Date <span className="text-red-500">*</span>
                  </>
                }
                placeholder="Select start date"
              />
              <FormDateInput
                formControl={form.control}
                name="endDate"
                label={
                  <>
                    End Date <span className="text-red-500">*</span>
                  </>
                }
                placeholder="Select end date"
              />
            </div>

            {/* Numbers */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="estimatedHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Hours <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.5"
                        min="0"
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
                    <FormLabel>Planned Duration <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
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
