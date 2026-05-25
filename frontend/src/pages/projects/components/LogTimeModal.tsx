import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateWorklogMutation } from "@/features/worklogs/worklogsApiSlice";
import type { Task } from "@/features/tasks/tasksApiSlice";
import { Calendar } from "lucide-react";

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
  Textarea,
} from "ikon-react-components-lib";

const baseWorklogSchema = z.object({
  description: z.string().optional(),
  date: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  totalHours: z.number().min(0.1, "Must log at least 0.1 hours").optional(),
});

export type WorklogFormValues = z.infer<typeof baseWorklogSchema>;

interface Props {
  open: boolean;
  task: Task | null;
  onClose: () => void;
}

export default function LogTimeModal({ open, task, onClose }: Props) {
  const [createWorklog, { isLoading }] = useCreateWorklogMutation();

  const [isMultiDay, setIsMultiDay] = useState(false);
  const [distributionType, setDistributionType] = useState<"EQUAL" | "CUSTOM">(
    "EQUAL",
  );
  const [customDistribution, setCustomDistribution] = useState<
    Record<string, number>
  >({});

  const dynamicSchema = useMemo(() => {
    return baseWorklogSchema.superRefine((data, ctx) => {
      if (isMultiDay && data.startDate && data.endDate && new Date(data.startDate) > new Date(data.endDate)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Start Date must not be later than End Date", path: ["startDate"] });
      }

      if (!task?.startDate || !task?.endDate) return;
      const tStart = new Date(task.startDate);
      const tEnd = new Date(task.endDate);

      if (!isMultiDay && data.date) {
        const d = new Date(data.date);
        if (d < tStart || d > tEnd) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Date must be between ${task.startDate} and ${task.endDate}`, path: ["date"] });
        }
      }

      if (isMultiDay && data.startDate) {
        const sd = new Date(data.startDate);
        if (sd < tStart || sd > tEnd) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Out of Task bounds: ${task.startDate} to ${task.endDate}`, path: ["startDate"] });
        }
      }

      if (isMultiDay && data.endDate) {
        const ed = new Date(data.endDate);
        if (ed < tStart || ed > tEnd) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Out of Task bounds: ${task.startDate} to ${task.endDate}`, path: ["endDate"] });
        }
      }
    });
  }, [task, isMultiDay]);

  const form = useForm<WorklogFormValues>({
    resolver: zodResolver(dynamicSchema),
    defaultValues: {
      description: "",
      date: new Date().toISOString().substring(0, 10),
      startDate: new Date().toISOString().substring(0, 10),
      endDate: new Date().toISOString().substring(0, 10),
      totalHours: 1,
    },
  });

  const startDateVal = form.watch("startDate");
  const endDateVal = form.watch("endDate");
  const totalHoursVal = form.watch("totalHours") || 0;

  // Calculate days in range
  const daysInRange = useMemo(() => {
    if (!isMultiDay || !startDateVal || !endDateVal) return [];
    const start = new Date(startDateVal);
    const end = new Date(endDateVal);
    if (start > end) return [];

    const days: string[] = [];
    let current = new Date(start);
    while (current <= end) {
      days.push(current.toISOString().substring(0, 10));
      current.setDate(current.getDate() + 1);
    }
    return days;
  }, [isMultiDay, startDateVal, endDateVal]);

  const numberOfDays = daysInRange.length;
  const hoursPerDayEqual =
    numberOfDays > 0 ? Number((totalHoursVal / numberOfDays).toFixed(2)) : 0;

  // Initialize custom distribution when switching to CUSTOM or changing days
  useEffect(() => {
    if (distributionType === "CUSTOM" && numberOfDays > 0) {
      setCustomDistribution((prev) => {
        const newDist: Record<string, number> = {};
        daysInRange.forEach((date) => {
          newDist[date] =
            prev[date] !== undefined ? prev[date] : hoursPerDayEqual;
        });
        return newDist;
      });
    }
  }, [distributionType, daysInRange, hoursPerDayEqual]);

  const handleCustomHoursChange = (date: string, value: string) => {
    const parsed = value === "" ? 0 : parseFloat(value);
    setCustomDistribution((prev) => ({
      ...prev,
      [date]: isNaN(parsed) ? 0 : parsed,
    }));
  };

  const customTotal = useMemo(() => {
    return Object.values(customDistribution).reduce((acc, val) => acc + val, 0);
  }, [customDistribution]);

  const handleClose = () => {
    form.reset();
    setIsMultiDay(false);
    setDistributionType("EQUAL");
    onClose();
  };

  const handleLogTime = async (data: WorklogFormValues) => {
    if (!task) return;

    let distribution: Record<string, number> = {};

    if (!isMultiDay) {
      if (!data.date) return;
      distribution[data.date] = data.totalHours || 0;
    } else {
      if (daysInRange.length === 0) return; // Invalid range
      if (distributionType === "EQUAL") {
        const hpd = (data.totalHours || 0) / daysInRange.length;
        daysInRange.forEach((d) => (distribution[d] = hpd));
      } else {
        distribution = { ...customDistribution };
      }
    }

    try {
      await createWorklog({
        taskId: task.id,
        hoursDistribution: distribution,
        description: data.description,
      }).unwrap();
      handleClose();
    } catch (err) {
      console.error("Failed to log time:", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md border my-6 onInteractOutside={(e) => e.preventDefault()">
        <DialogHeader className="my-2 border-b border-gray-800 pb-4">
          <DialogTitle className="flex items-center gap-2">
            Log Time
          </DialogTitle>
          <span className="text-gray-500 text-sm">
            Record actual time spent on "{task?.title || "task"}"
          </span>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleLogTime)}
            className="space-y-5"
          >
            {/* Total Hours */}
            <FormField
              control={form.control}
              name="totalHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-500">
                    {isMultiDay ? "Total Hours" : "Hours Spent"}{" "}
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      className="
      bg-transparent 
      border 
      [.blue-dark_&]:focus-visible:ring-1
      [.blue-dark_&]:focus-visible:ring-indigo-500
      [.blue-dark_&]:focus-visible:border-indigo-500
    "
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === ""
                            ? undefined
                            : parseFloat(e.target.value),
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Multi-day Toggle */}
            <Button
              type="button"
              variant="outline"
              className={`w-fit py-1 h-8 text-sm flex items-center gap-2 border bg-transparent ${isMultiDay ? "text-indigo-400 border-indigo-500" : "text-gray-500"}`}
              onClick={() => setIsMultiDay(!isMultiDay)}
            >
              <Calendar size={14} />
              {isMultiDay ? "Multi-day enabled" : "Log across multiple days"}
            </Button>

            {/* Dates */}
            {!isMultiDay ? (
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-500">
                      Date <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        className="bg-transparent border"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <div className="space-y-4 border rounded-md border p-4 ">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-500">
                          Start Date <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            className="bg-transparent border [.blue-dark_&]:focus-visible:ring-1 [.blue-dark_&]:focus-visible:ring-indigo-500 [.blue-dark_&]:focus-visible:border-indigo-500"
                            {...field}
                            value={field.value || ""}
                          />
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
                        <FormLabel className="text-gray-500">
                          End Date <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            className="bg-transparent border [.blue-dark_&]:focus-visible:ring-1
      [.blue-dark_&]:focus-visible:ring-indigo-500
      [.blue-dark_&]:focus-visible:border-indigo-500"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex items-center gap-3 mt-4">
                  <span className="text-sm font-medium text-gray-500">
                    Distribution:
                  </span>
                  <div className="flex rounded-full p-1 border border-gray-800">
                    <button
                      type="button"
                      className={`px-3 py-1 text-xs rounded-full transition-colors ${distributionType === "EQUAL" ? "bg-indigo-500 text-white" : "text-gray-500"}`}
                      onClick={() => setDistributionType("EQUAL")}
                    >
                      Split equally
                    </button>
                    <button
                      type="button"
                      className={`px-3 py-1 text-xs rounded-full transition-colors ${distributionType === "CUSTOM" ? "bg-indigo-500 text-white" : "text-gray-500"}`}
                      onClick={() => setDistributionType("CUSTOM")}
                    >
                      Custom per day
                    </button>
                  </div>
                </div>

                {numberOfDays > 0 && (
                  <div className="text-xs text-gray-500 mt-2">
                    {numberOfDays} days selected —{" "}
                    {distributionType === "EQUAL"
                      ? `${hoursPerDayEqual}h per day`
                      : ""}
                  </div>
                )}

                {distributionType === "CUSTOM" && numberOfDays > 0 && (
                  <div className="mt-3 max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {daysInRange.map((date) => {
                      const dateObj = new Date(date);
                      const dayName = dateObj.toLocaleDateString("en-US", {
                        weekday: "short",
                      });
                      const monthDay = dateObj.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      });
                      return (
                        <div
                          key={date}
                          className="flex justify-between items-center text-sm"
                        >
                          <span className="text-gray-500 w-24">
                            {dayName}, {monthDay}
                          </span>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              step="0.01"
                              className="w-20 h-7 text-right bg-transparent border-gray-700"
                              value={
                                customDistribution[date] !== undefined
                                  ? customDistribution[date]
                                  : hoursPerDayEqual
                              }
                              onChange={(e) =>
                                handleCustomHoursChange(date, e.target.value)
                              }
                            />
                            <span className="text-gray-500 text-xs">h</span>
                          </div>
                        </div>
                      );
                    })}
                    <div className="pt-2 text-xs">
                      <span
                        className={
                          Math.abs(customTotal - totalHoursVal) > 0.01
                            ? "text-amber-500"
                            : "text-gray-500"
                        }
                      >
                        Custom total: {customTotal.toFixed(2)}h (total is{" "}
                        {totalHoursVal.toFixed(2)}h,{" "}
                        {Math.abs(customTotal - totalHoursVal).toFixed(2)}h{" "}
                        {customTotal > totalHoursVal ? "over" : "under"})
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-500">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What did you work on?"
                      className="min-h-[80px] bg-transparent border   [.blue-dark_&]:focus-visible:ring-1
      [.blue-dark_&]:focus-visible:ring-indigo-500
      [.blue-dark_&]:focus-visible:border-indigo-500"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="ghost"
                className="text-gray-500 border hover:text-white"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? "Saving..."
                  : isMultiDay && numberOfDays > 0
                    ? `Log ${numberOfDays} Days`
                    : "Log Time"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
