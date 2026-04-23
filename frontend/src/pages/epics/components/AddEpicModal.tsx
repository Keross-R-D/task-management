import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, Button, Form, FormField, FormItem, FormLabel, FormControl, FormMessage, Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Textarea } from "ikon-react-components-lib";

const epicSchema = z.object({
  name: z.string().min(1, "Epic Name is required"),
  description: z.string().optional(),
  status: z.string().min(1, "Status is required"),
  startDate: z.string().min(1, "Start Date is required"),
  endDate: z.string().min(1, "End Date is required"),
});

export type EpicFormValues = z.infer<typeof epicSchema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: EpicFormValues) => void;
  isLoading?: boolean;
}

export default function AddEpicModal({ open, onClose, onSubmit, isLoading }: Props) {
  const form = useForm<EpicFormValues>({
    resolver: zodResolver(epicSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "TODO",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date((new Date()).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const handleCreate = (data: EpicFormValues) => {
    onSubmit(data);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Add New Epic</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel>Epic Name <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Authentication Overhaul" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="What is the overarching goal?" rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }: any) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }: any) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }: any) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="TODO">To Do</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="DONE">Done</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="secondary" onClick={handleClose}>Cancel</Button>
              <Button type="submit" disabled={isLoading}>{isLoading ? "Creating..." : "Create Epic"}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
