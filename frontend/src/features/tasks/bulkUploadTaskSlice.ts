import { apiSlice } from "../api/apiSlice";

export interface BulkTaskUploadRequest {
  projectId: string;
  epicName: string;
  sprintName: string;
  title: string;
  description: string;
  type: string;
  status: string;
  priority: string;
  estimatedHours: number;
  startDate: string;
  endDate: string;
  plannedDuration: number;
}

export const tasksApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    bulkUploadTasks: builder.mutation<void, BulkTaskUploadRequest[]>({
      query: (tasks) => ({
        apiUrl: "/tasks/bulk-upload",
        config: {
          method: "POST",
          data: tasks,
        },
      }),

      invalidatesTags: (_result, _error, arg) => {
        const projectId = arg[0]?.projectId;

        return [
          { type: "Task", id: `LIST_PROJ_${projectId}` },
          { type: "Task", id: `BACKLOG_${projectId}` },
          { type: "Sprint", id: `LIST_PROJ_${projectId}` },
          { type: "Epic", id: `LIST_${projectId}` },
        ];
      },
    }),
  }),
});

export const { useBulkUploadTasksMutation } = tasksApiSlice;
