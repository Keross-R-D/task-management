import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateSprintMutation, useUpdateSprintMutation } from "@/features/sprints/sprintsApiSlice";
import { useEffect } from "react";
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
} from "ikon-react-components-lib";


const sprintSchema = z.object({
  name: z.string().min(2, "Sprint name is required"),
  goal: z.string().min(3, "Goal is required"),
  status: z.string().min(3, "Status is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
});

export type SprintFormValues = z.infer<typeof sprintSchema>;

interface Props {
  open: boolean;
  projectId: string;
  epicId: string;
  sprint?: Sprint | null;
  onClose: () => void;
}

export default function AddSprintModal({
  open,
  projectId,
  epicId,
  sprint,
  onClose,
}: Props) {
  const [createSprint, { isLoading: isCreating }] = useCreateSprintMutation();
  const [updateSprint, { isLoading: isUpdating }] = useUpdateSprintMutation();

  const isLoading = isCreating || isUpdating;

  const form = useForm<SprintFormValues>({
    resolver: zodResolver(sprintSchema),
    defaultValues: {
      name: "",
      goal: "",
      status: "",
      startDate: "",
      endDate: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (sprint) {
        form.reset({
          name: sprint.name || "",
          goal: sprint.goal || "",
          status: sprint.status || "",
          startDate: sprint.startDate ? new Date(sprint.startDate).toISOString().split('T')[0] : "",
          endDate: sprint.endDate ? new Date(sprint.endDate).toISOString().split('T')[0] : "",
        });
      } else {
        form.reset({
          name: "",
          goal: "",
          status: "PLANNED",
          startDate: "",
          endDate: "",
        });
      }
    }
  }, [sprint, open, form]);

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const handleCreateOrUpdate = async (data: SprintFormValues) => {
    try {
      if (sprint && sprint.id) {
        await updateSprint({
          id: sprint.id,
          ...data,
          projectId,
          epicId,
        }).unwrap();
      } else {
        await createSprint({
          ...data,
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
      <DialogContent className="max-w-lg">
        <DialogHeader className="my-3">
          <DialogTitle>{sprint ? "Edit Sprint" : "Add Sprint"}</DialogTitle>
          <span className="text-gray-400">
            {sprint ? "Update details for the sprint." : "Create a new sprint within this epic."}
          </span>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleCreateOrUpdate)} className="space-y-4">

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

                    <SelectContent>
                      <SelectItem value="PLANNED">Planned</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Start Date <span className="text-red-500">*</span>
                    </FormLabel>
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
                    <FormLabel>
                      End Date <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : sprint ? "Update Sprint" : "Add Sprint"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}