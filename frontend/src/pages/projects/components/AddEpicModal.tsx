import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateEpicMutation, useUpdateEpicMutation } from "@/features/epics/epicsApiSlice";
import React, { useEffect } from "react";
import type { Epic as EpicType } from "@/features/epics/epicsApiSlice";
import { EpicEnum } from "@/enums/epic.constants";

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

const baseEpicSchema = z.object({
  name: z.string().min(3, "Epic name is required"),
  description: z.string().min(5, "Description is required"),
  status: z.string().min(4, "Status is required"),
  startDate: z.date({
    error: "Start date is required",
  }),
  endDate: z.date({
    error: "End date is required",
  }),
});

export type EpicFormValues = z.infer<typeof baseEpicSchema>;

interface Props {
  open: boolean;
  projectId: string;
  epic?: EpicType | null;
  projectStartDate?: string;
  projectEndDate?: string;
  onClose: () => void;
}

export default function AddEpicModal({
  open,
  projectId,
  epic,
  projectStartDate,
  projectEndDate,
  onClose,
}: Props) {
  const [createEpic, { isLoading: isCreating }] = useCreateEpicMutation();
  const [updateEpic, { isLoading: isUpdating }] = useUpdateEpicMutation();

  const isLoading = isCreating || isUpdating;

  //Function to normalize the dates
  const normalizeDate = (date: Date) => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  };

  //Validation to check whether the start and end dates are valid or not
  const dynamicSchema = React.useMemo(() => {
    return baseEpicSchema.superRefine((data, ctx) => {

      const epicStart = normalizeDate(data.startDate);
      const epicEnd = normalizeDate(data.endDate);

      const projectStart = projectStartDate
        ? normalizeDate(new Date(projectStartDate))
        : null;

      const projectEnd = projectEndDate
        ? normalizeDate(new Date(projectEndDate))
        : null;

      // Epic start must not be after epic end
      if (epicStart > epicEnd) {
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

      // Epic cannot start before project start
      if (projectStart && epicStart < projectStart) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Cannot be earlier than project start date (${projectStartDate})`,
          path: ["startDate"],
        });
      }

      // Epic cannot end after project end
      if (projectEnd && epicEnd > projectEnd) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Cannot be later than project end date (${projectEndDate})`,
          path: ["endDate"],
        });
      }
    });
  }, [projectStartDate, projectEndDate]);

  const form = useForm<EpicFormValues>({
    resolver: zodResolver(dynamicSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "",
      startDate: undefined,
      endDate: undefined,
    },
  });

  useEffect(() => {
    if (open) {
      if (epic) {
        form.reset({
          name: epic.name || "",
          description: epic.description || "",
          status: epic.status || "",
          startDate: epic.startDate
            ? new Date(epic.startDate)
            : undefined,
          endDate: epic.endDate
            ? new Date(epic.endDate)
            : undefined,
        });
      } else {
        form.reset({
          name: "",
          description: "",
          status: "",
          startDate: undefined,
          endDate: undefined,
        });
      }
    }
  }, [epic, open, form]);

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

  const handleCreateOrUpdate = async (data: EpicFormValues) => {
    try {
      if (epic && epic.id) {
        await updateEpic({
          id: epic.id,
          ...data,
          startDate: formatLocalDate(data.startDate),
          endDate: formatLocalDate(data.endDate),
          projectId,
        }).unwrap();
      } else {
        await createEpic({
          ...data,
          startDate: formatLocalDate(data.startDate),
          endDate: formatLocalDate(data.endDate),
          projectId,
        }).unwrap();
      }
      form.reset();
      onClose();
    } catch (err) {
      console.error("Failed to save epic:", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader className="my-1">
          <DialogTitle><div className="text-xl">{epic ? "Edit Epic" : "Add Epic"}</div>
            <div className="text-muted-foreground text-sm">
              {epic
                ? "Update details for the epic."
                : "Create a new epic for this project."}
            </div>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleCreateOrUpdate)}
            className="space-y-4"
          >
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Epic Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Authentication Module"
                      {...field}
                    />
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
                  <FormLabel>
                    Description <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the epic..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                      {Object.values(EpicEnum.Status).map((status) => (
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

            {/* Status */}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : epic ? "Update Epic" : "Add Epic"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
