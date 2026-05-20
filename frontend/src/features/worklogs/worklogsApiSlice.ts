import { apiSlice } from "../api/apiSlice";

export interface TaskWorklog {
  id: string; // UUID
  taskId: string; // UUID
  hoursDistribution: Record<string, number>; // JSONB mapped to object
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateWorklogRequest = Omit<
  TaskWorklog,
  "id" | "createdAt" | "updatedAt"
>;
export type UpdateWorklogRequest = Partial<CreateWorklogRequest> & {
  id: string;
  taskId: string;
};

export const worklogsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getWorklogsByTask: builder.query<TaskWorklog[], string>({
      query: (taskId) => ({ apiUrl: `/worklogs/task/${taskId}` }),
      providesTags: (result, _error, taskId) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Worklog" as const, id })),
              { type: "Worklog", id: `LIST_TASK_${taskId}` },
              { type: "Worklog", id: "LIST" },
            ]
          : [
              { type: "Worklog", id: `LIST_TASK_${taskId}` },
              { type: "Worklog", id: "LIST" },
            ],
    }),
    createWorklog: builder.mutation<TaskWorklog, CreateWorklogRequest>({
      query: (worklog) => ({
        apiUrl: "/worklogs",
        config: {
          method: "POST",
          data: worklog,
        },
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Worklog" as const, id: `LIST_TASK_${arg.taskId}` },
        { type: "Worklog" as const, id: "LIST" },
        "Worklog",
        { type: "Task", id: arg.taskId }, // Invalidate task to update actualHours
      ],
    }),
    updateWorklog: builder.mutation<TaskWorklog, UpdateWorklogRequest>({
      query: ({ id, ...patch }) => ({
        apiUrl: `/worklogs/${id}`,
        config: {
          method: "PUT",
          data: patch,
        },
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Worklog" as const, id: arg.id },
        { type: "Worklog" as const, id: `LIST_TASK_${arg.taskId}` },
        { type: "Worklog" as const, id: "LIST" },
        "Worklog",
        { type: "Task", id: arg.taskId },
      ],
    }),
    deleteWorklog: builder.mutation<void, { id: string; taskId: string }>({
      query: ({ id }) => ({
        apiUrl: `/worklogs/${id}`,
        config: { method: "DELETE" },
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Worklog" as const, id: arg.id },
        { type: "Worklog" as const, id: `LIST_TASK_${arg.taskId}` },
        { type: "Worklog" as const, id: "LIST" },   "Worklog",  { type: "Task", id: arg.taskId },
      ],
    }),
    getWorklogsByProject: builder.query<TaskWorklog[], string>({
      query: (projectId) => ({ apiUrl: `/worklogs/project/${projectId}` }),
      providesTags: (result, _error, projectId) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Worklog" as const, id })),
              { type: "Worklog", id: `LIST_PROJECT_${projectId}` },
              { type: "Worklog", id: "LIST" },
            ]
          : [
              { type: "Worklog", id: `LIST_PROJECT_${projectId}` },
              { type: "Worklog", id: "LIST" },
            ],
    }),
  }),
});

export const {
  useGetWorklogsByTaskQuery,
  useGetWorklogsByProjectQuery,
  useCreateWorklogMutation,
  useUpdateWorklogMutation,
  useDeleteWorklogMutation,
} = worklogsApiSlice;
