import { apiSlice } from '../api/apiSlice';

export interface TaskWorklog {
  id: string; // UUID
  taskId: string; // UUID
  projectId: string; // UUID
  hoursDistribution: Record<string, number>; // JSONB mapped to object
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateWorklogRequest = Omit<TaskWorklog, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateWorklogRequest = Partial<CreateWorklogRequest> & { id: string };

export const worklogsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getWorklogsByTask: builder.query<TaskWorklog[], string>({
      query: (taskId) => ({ apiUrl: `/worklogs/task/${taskId}` }),
      providesTags: (result, _error, taskId) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Worklog' as const, id })),
              { type: 'Worklog', id: `LIST_TASK_${taskId}` },
            ]
          : [{ type: 'Worklog', id: `LIST_TASK_${taskId}` }],
    }),
    createWorklog: builder.mutation<TaskWorklog, CreateWorklogRequest>({
      query: (worklog) => ({
        apiUrl: '/worklogs',
        config: {
          method: 'POST',
          data: worklog,
        },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Worklog', id: `LIST_TASK_${arg.taskId}` },
        { type: 'Task', id: arg.taskId } // Invalidate task to update actualHours
      ],
    }),
    updateWorklog: builder.mutation<TaskWorklog, UpdateWorklogRequest>({
      query: ({ id, ...patch }) => ({
        apiUrl: `/worklogs/${id}`,
        config: {
          method: 'PUT',
          data: patch,
        },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Worklog', id: arg.id },
        { type: 'Task', id: arg.taskId || 'UNKNOWN' } // Invalidate task if taskId available
      ],
    }),
    deleteWorklog: builder.mutation<void, { id: string, taskId: string }>({
      query: ({ id }) => ({
        apiUrl: `/worklogs/${id}`,
        config: { method: 'DELETE' },
      }),
      invalidatesTags: (result, error, arg) => [
        'Worklog', 
        { type: 'Task', id: arg.taskId } // Invalidate task
      ],
    }),
  }),
});

export const {
  useGetWorklogsByTaskQuery,
  useCreateWorklogMutation,
  useUpdateWorklogMutation,
  useDeleteWorklogMutation,
} = worklogsApiSlice;
