import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Button,
} from "ikon-react-components-lib";
import { Trash2, Timer, User, History } from "lucide-react";
import {
  useGetWorklogsByTaskQuery,
  useUpdateWorklogMutation,
  useDeleteWorklogMutation,
  type TaskWorklog,
} from "@/features/worklogs/worklogsApiSlice";
import type { Task } from "@/features/tasks/tasksApiSlice";
import { toast } from "sonner";

interface Props {
  open: boolean;
  task: Task | null;
  onClose: () => void;
  onLogMoreTime: () => void;
}

interface FlattenedLog {
  worklogId: string;
  date: string;
  hours: number;
  description: string;
  createdAt?: string;
  originalWorklog: TaskWorklog;
}

export default function ViewTimeLogsModal({
  open,
  task,
  onClose,
  onLogMoreTime,
}: Props) {
  const { data: worklogs = [], isLoading } = useGetWorklogsByTaskQuery(
    task?.id || "",
    {
      skip: !task?.id || !open,
    }
  );

  const [updateWorklog] = useUpdateWorklogMutation();
  const [deleteWorklog] = useDeleteWorklogMutation();

  const flattenedLogs = useMemo(() => {
    const logs: FlattenedLog[] = [];
    worklogs.forEach((log) => {
      const dist = log.hoursDistribution || {};
      Object.keys(dist).forEach((date) => {
        logs.push({
          worklogId: log.id,
          date,
          hours: dist[date],
          description: log.description || "",
          createdAt: log.createdAt,
          originalWorklog: log,
        });
      });
    });

    // Sort by date descending
    return logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [worklogs]);

  const totalLogged = flattenedLogs.reduce((acc, log) => acc + log.hours, 0);
  const estimated = task?.estimatedHours || 0;
  const remaining = Math.max(0, estimated - totalLogged);
  const progressPercent =
    estimated > 0 ? Math.min(100, Math.round((totalLogged / estimated) * 100)) : 0;

  const handleDeleteLog = async (log: FlattenedLog) => {
    try {
      const updatedDist = { ...log.originalWorklog.hoursDistribution };
      delete updatedDist[log.date];

      // If there are no more dates remaining in this worklog, delete the entire worklog
      if (Object.keys(updatedDist).length === 0) {
        await deleteWorklog({ id: log.worklogId, taskId: task!.id }).unwrap();
        toast.success("Time log removed.");
      } else {
        // Otherwise update the worklog with the date removed
        await updateWorklog({
          id: log.worklogId,
          taskId: task!.id,
          hoursDistribution: updatedDist,
        }).unwrap();
        toast.success("Time log updated.");
      }
    } catch (err) {
      console.error("Failed to delete time log: ", err);
      toast.error("Failed to remove time log.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg bg-[#0b0c10] text-gray-100 border-gray-800">
        <DialogHeader className="my-2 border-b border-gray-800 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" /> Time Logs
          </DialogTitle>
          <span className="text-gray-400 text-sm">
            Logged time entries for "{task?.title || "task"}"
          </span>
        </DialogHeader>

        <div className="flex flex-col gap-6 mt-2">
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-800 bg-[#111218]">
              <span className="text-xs text-gray-400 font-medium tracking-wide">
                Estimated
              </span>
              <span className="text-xl font-bold mt-1 text-white">
                {estimated}h
              </span>
            </div>
            <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-indigo-900/50 bg-[#111218]">
              <span className="text-xs text-indigo-300 font-medium tracking-wide">
                Logged
              </span>
              <span className="text-xl font-bold mt-1 text-indigo-400">
                {totalLogged.toFixed(1)}h
              </span>
            </div>
            <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-800 bg-[#111218]">
              <span className="text-xs text-gray-400 font-medium tracking-wide">
                Remaining
              </span>
              <span className="text-xl font-bold mt-1 text-white">
                {remaining.toFixed(1)}h
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-400 font-medium">
              <span>Progress</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-indigo-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Entries List */}
          <div className="space-y-3 mt-4">
            <div className="text-sm text-gray-400 font-medium">
              {flattenedLogs.length} {flattenedLogs.length === 1 ? "entry" : "entries"}
            </div>

            {isLoading ? (
              <div className="h-32 flex items-center justify-center">
                <span className="text-gray-500 text-sm flex items-center gap-2">
                  <Timer className="animate-spin h-4 w-4" /> Loading entries...
                </span>
              </div>
            ) : flattenedLogs.length === 0 ? (
              <div className="h-32 flex flex-col items-center justify-center text-gray-500 space-y-2">
                <Timer className="h-8 w-8 opacity-20" />
                <span className="text-sm">No time logged yet</span>
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {flattenedLogs.map((log, index) => {
                  const dateObj = new Date(log.date);
                  const displayDate = dateObj.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });

                  return (
                    <div
                      key={`${log.worklogId}-${log.date}-${index}`}
                      className="group relative p-4 rounded-xl border border-gray-800 bg-[#111218] hover:border-gray-700 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">
                            {log.hours}h
                          </span>
                          <span className="text-sm text-gray-500">
                            on {displayDate}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteLog(log)}
                          className="text-gray-500 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100"
                          title="Delete entry"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
                        <User className="h-3 w-3" />
                        <span>Current User</span>
                      </div>

                      {log.description && (
                        <p className="mt-3 text-sm text-gray-300">
                          {log.description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="flex justify-end items-center gap-3 pt-4 border-t border-gray-800 mt-2">
            <Button
              variant="ghost"
              className="text-gray-400 hover:text-white"
              onClick={onClose}
            >
              Close
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={() => {
                onClose();
                onLogMoreTime();
              }}
            >
              <Timer className="h-4 w-4 mr-2" /> Log More Time
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
