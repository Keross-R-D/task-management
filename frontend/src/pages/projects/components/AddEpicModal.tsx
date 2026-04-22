import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateEpicMutation, useUpdateEpicMutation } from "@/features/epics/epicsApiSlice";
import { useEffect } from "react";
import type { Epic as EpicType } from "@/features/epics/epicsApiSlice";

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

const epicSchema = z.object({
  name: z.string().min(3, "Epic name is required"),
  description: z.string().min(5, "Description is required"),
  status: z.string().min(4, "Status is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
});

export type EpicFormValues = z.infer<typeof epicSchema>;

interface Props {
  open: boolean;
  projectId: string;
  epic?: EpicType | null;
  onClose: () => void;
}

export default function AddEpicModal({
  open,
  projectId,
  epic,
  onClose,
}: Props) {
  const [createEpic, { isLoading: isCreating }] = useCreateEpicMutation();
  const [updateEpic, { isLoading: isUpdating }] = useUpdateEpicMutation();

  const isLoading = isCreating || isUpdating;

  const form = useForm<EpicFormValues>({
    resolver: zodResolver(epicSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "",
      startDate: "",
      endDate: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (epic) {
        form.reset({
          name: epic.name || "",
          description: epic.description || "",
          status: epic.status || "",
          startDate: epic.startDate ? new Date(epic.startDate).toISOString().split('T')[0] : "",
          endDate: epic.endDate ? new Date(epic.endDate).toISOString().split('T')[0] : "",
        });
      } else {
        form.reset({
          name: "",
          description: "",
          status: "NOT_STARTED",
          startDate: "",
          endDate: "",
        });
      }
    }
  }, [epic, open, form]);

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const handleCreateOrUpdate = async (data: EpicFormValues) => {
    try {
      if (epic && epic.id) {
        await updateEpic({
          id: epic.id,
          ...data,
          projectId,
        }).unwrap();
      } else {
        await createEpic({
          ...data,
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
      <DialogContent className="max-w-lg">
        <DialogHeader className="my-3">
          <DialogTitle>{epic ? "Edit Epic" : "Add Epic"}</DialogTitle>
          <span className="text-gray-400">
            {epic ? "Update details for the epic." : "Create a new epic for this project."}
          </span>
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

                    <SelectContent>
                      <SelectItem value="NOT_STARTED">Not Started</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
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
