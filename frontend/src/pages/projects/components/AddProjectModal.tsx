import { useForm } from "react-hook-form";
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
  FormMultiComboboxInput,
} from "ikon-react-components-lib";
import { ProjectEnum } from "@/enums/project.constants";
import { useUserMap } from "@/utils/userMap";

const projectSchema = z
  .object({
    projectName: z.string().min(1, "Project name is required"),
    clientName: z.string().min(1, "Client name is required"),
    managerId: z.string().min(1, "Client name is required"),
    managerDelegateId: z.string().min(1, "Client name is required"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    projectStatus: z.string().min(1, "Status is required"),
    type: z.string().min(1, "Type is required"),
    teamMemberIds: z.array(z.string()).default([]),
  })
  .superRefine((data, ctx) => {
    if (
      data.startDate &&
      data.endDate &&
      new Date(data.startDate) > new Date(data.endDate)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Start Date must not be later than End Date",
        path: ["startDate"],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End Date must not be earlier than Start Date",
        path: ["endDate"],
      });
    }
  });

export type ProjectFormValues = z.infer<typeof projectSchema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ProjectFormValues) => void;
  isLoading?: boolean;
}

export default function AddProjectModal({
  open,
  onClose,
  onSubmit,
  isLoading,
}: Props) {
  const { allUsers, isLoading: usersLoading } = useUserMap();

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      projectName: "",
      clientName: "",
      managerId: "",
      managerDelegateId: "",
      startDate: "",
      endDate: "",
      projectStatus: "",
      type: "",
      teamMemberIds: [],
    },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const handleCreate = (data: ProjectFormValues) => {
    onSubmit(data);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Project</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleCreate)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="projectName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Project Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Website Redesign" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="clientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Client Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Acme Corp" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="projectStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Status <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(ProjectEnum.Status).map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.replace("_", " ")}
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
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Type <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(ProjectEnum.Type).map((type) => (
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

              {/* <FormField
                control={form.control}
                name="teamMemberIds"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Team Members</FormLabel>
                    <FormControl>
                      <div className="border rounded-md p-2 max-h-40 overflow-y-auto space-y-2">
                        {usersLoading ? (
                          <div className="text-sm text-muted-foreground p-2">Loading users...</div>
                        ) : allUsers.length === 0 ? (
                          <div className="text-sm text-muted-foreground p-2">No users available</div>
                        ) : (
                          allUsers.map((user) => (
                            <label key={user.id} className="flex items-center space-x-2 cursor-pointer p-1 hover:bg-muted rounded">
                              <input
                                type="checkbox"
                                className="rounded border-gray-300 w-4 h-4"
                                checked={field.value.includes(user.id)}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  if (checked) {
                                    field.onChange([...field.value, user.id]);
                                  } else {
                                    field.onChange(field.value.filter((id) => id !== user.id));
                                  }
                                }}
                              />
                              <span className="text-sm">{user.name} <span className="text-muted-foreground text-xs">({user.email})</span></span>
                            </label>
                          ))
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}
              {/* <Textarea /> */}
            </div>
            <FormMultiComboboxInput
              formControl={form.control}
              name="teamMemberIds"
              label="Team Members"
              placeholder={
                usersLoading ? "Loading users..." : "Select team members..."
              }
              disabled={usersLoading || allUsers.length === 0}
              items={allUsers.map((user) => ({
                // Assuming FormComboboxItemProps uses standard 'value' and 'label' keys.
                // Adjust these keys if your specific interface requires 'id' or 'text'.
                value: user.id,
                label: `${user.name} (${user.email})`,
              }))}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Manager */}
              <FormField
                control={form.control}
                name="managerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Manager <span className="text-red-500">*</span>
                    </FormLabel>

                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Manager" />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
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

              {/* Manager Delegate */}
              <FormField
                control={form.control}
                name="managerDelegateId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Manager Delegate <span className="text-red-500">*</span>
                    </FormLabel>

                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Manager Delegate" />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
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

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
