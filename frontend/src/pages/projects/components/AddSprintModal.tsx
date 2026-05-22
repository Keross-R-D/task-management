import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateSprintMutation, useUpdateSprintMutation } from "@/features/sprints/sprintsApiSlice";
import React, { useEffect } from "react";
import type { Sprint } from "@/features/sprints/sprintsApiSlice";

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
import { SprintEnum } from "@/enums/sprint.constants";

const baseSprintSchema = z.object({
  name: z.string().min(2, "Sprint name is required"),
  goal: z.string().min(3, "Goal is required"),
  status: z.string().min(3, "Status is required"),
  startDate: z.date({
    error: "Start date is required",
  }),
  endDate: z.date({
    error: "End date is required",
  }),
});

export type SprintFormValues = z.infer<typeof baseSprintSchema>;

interface Props {
  open: boolean;
  projectId: string;
  epicId: string;
  sprint?: Sprint | null;
  epicStartDate?: string;
  epicEndDate?: string;
  onClose: () => void;
}

export default function AddSprintModal({
  open,
  projectId,
  epicId,
  sprint,
  epicStartDate,
  epicEndDate,
  onClose,
}: Props) {
  const [createSprint, { isLoading: isCreating }] = useCreateSprintMutation();
  const [updateSprint, { isLoading: isUpdating }] = useUpdateSprintMutation();

  const isLoading = isCreating || isUpdating;

  //Function to normalize the date
  const normalizeDate = (date: Date) => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  };

  //Validation to check whether the start and end dates are valid or not
  const dynamicSchema = React.useMemo(() => {
    return baseSprintSchema.superRefine((data, ctx) => {

      const sprintStart = normalizeDate(data.startDate);
      const sprintEnd = normalizeDate(data.endDate);

      const epicStart = epicStartDate
        ? normalizeDate(new Date(epicStartDate))
        : null;

      const epicEnd = epicEndDate
        ? normalizeDate(new Date(epicEndDate))
        : null;

      // Sprint start must not be after sprint end
      if (sprintStart > sprintEnd) {
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

      // Sprint cannot start before epic start
      if (epicStart && sprintStart < epicStart) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Cannot be earlier than Epic start date (${epicStartDate})`,
          path: ["startDate"],
        });
      }

      // Sprint cannot end after epic end
      if (epicEnd && sprintEnd > epicEnd) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Cannot be later than Epic end date (${epicEndDate})`,
          path: ["endDate"],
        });
      }
    });
  }, [epicStartDate, epicEndDate]);

  const form = useForm<SprintFormValues>({
    resolver: zodResolver(dynamicSchema),
    defaultValues: {
      name: "",
      goal: "",
      status: "",
      startDate: undefined,
      endDate: undefined,
    },
  });

  useEffect(() => {
    if (open) {
      if (sprint) {
        form.reset({
          name: sprint.name || "",
          goal: sprint.goal || "",
          status: sprint.status || "",
          startDate: sprint.startDate
            ? new Date(sprint.startDate)
            : undefined,
          endDate: sprint.endDate
            ? new Date(sprint.endDate)
            : undefined,
        });
      } else {
        form.reset({
          name: "",
          goal: "",
          status: "",
          startDate: undefined,
          endDate: undefined,
        });
      }
    }
  }, [sprint, open, form]);

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

  const handleCreateOrUpdate = async (data: SprintFormValues) => {
    try {
      if (sprint && sprint.id) {
        await updateSprint({
          id: sprint.id,
          ...data,
          startDate: formatLocalDate(data.startDate),
          endDate: formatLocalDate(data.endDate),
          projectId,
          epicId,
        }).unwrap();
      } else {
        await createSprint({
          ...data,
          startDate: formatLocalDate(data.startDate),
          endDate: formatLocalDate(data.endDate),
          projectId,
          epicId,
        }).unwrap();
      }
      form.reset();
      onClose();
    } catch (err) {
      console.error("Failed to save sprint:", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader className="my-1">
          <DialogTitle><div className="text-xl">{sprint ? "Edit Sprint" : "Add Sprint"}</div>
            <div className="text-muted-foreground text-sm">
              {sprint
                ? "Update details for the sprint."
                : "Create a new sprint within this epic."}
            </div>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleCreateOrUpdate)}
            className="space-y-4"
          >
            {/* Sprint Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Sprint Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Sprint 1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Goal */}
            <FormField
              control={form.control}
              name="goal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Goal <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What is the goal of this sprint?"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
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
                  <FormLabel>
                    Status <span className="text-red-500">*</span>
                  </FormLabel>

                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent position="popper">
                      {Object.values(SprintEnum.Status).map((status) => (
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

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? "Saving..."
                  : sprint
                    ? "Update Sprint"
                    : "Add Sprint"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
