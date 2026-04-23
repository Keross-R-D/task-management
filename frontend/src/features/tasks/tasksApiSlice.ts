import { apiSlice } from '../api/apiSlice';

export interface Task {
  id: string; // UUID
  projectId: string; // UUID
  epicId?: string | null; // UUID
  sprintId?: string | null; // UUID
  title: string;
  description?: string;
  type: string; // task, bug, story, improvement
  status: string; // todo, in_progress, done, blocked
  priority: string; // low, medium, high, critical
  assigneeId?: string | null; // UUID
  reporterId?: string | null; // UUID
  estimatedHours: number;
  actualHours: number; // Controlled by backend trigger/cache
  startDate?: string;
  endDate?: string;
  plannedDuration?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateTaskRequest = Omit<Task, 'id' | 'actualHours' | 'createdAt' | 'updatedAt'>;
export type UpdateTaskRequest = Partial<CreateTaskRequest> & { id: string };

export const tasksApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTasksByProject: builder.query<Task[], string>({
      query: (projectId) => ({ apiUrl: `/tasks/project/${projectId}` }),
      providesTags: (result, error, projectId) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Task' as const, id })),
              { type: 'Task', id: `LIST_PROJ_${projectId}` },
            ]
          : [{ type: 'Task', id: `LIST_PROJ_${projectId}` }],
    }),
    getTasksBacklog: builder.query<Task[], string>({
      query: (projectId) => ({ apiUrl: `/tasks/project/${projectId}/backlog` }),
      providesTags: (result, error, projectId) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Task' as const, id })),
              { type: 'Task', id: `BACKLOG_${projectId}` },
            ]
          : [{ type: 'Task', id: `BACKLOG_${projectId}` }],
    }),
    getTasksBySprint: builder.query<Task[], string>({
      query: (sprintId) => ({ apiUrl: `/tasks/sprint/${sprintId}` }),
      providesTags: (result, _error, sprintId) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Task' as const, id })),
              { type: 'Task', id: `LIST_SPRINT_${sprintId}` },
            ]
          : [{ type: 'Task', id: `LIST_SPRINT_${sprintId}` }],
    }),
    createTask: builder.mutation<Task, CreateTaskRequest>({
      query: (task) => ({
        apiUrl: '/tasks',
        config: {
          method: 'POST',
          data: task,
        },
      }),
      invalidatesTags: (_result, _error, arg) => {
        const tags: any[] = [{ type: 'Task', id: `LIST_PROJ_${arg.projectId}` }];
        if (!arg.sprintId) tags.push({ type: 'Task', id: `BACKLOG_${arg.projectId}` });
        if (arg.sprintId) tags.push({ type: 'Task', id: `LIST_SPRINT_${arg.sprintId}` });
        return tags;
      },
    }),
    updateTask: builder.mutation<Task, UpdateTaskRequest>({
      query: ({ id, ...patch }) => ({
        apiUrl: `/tasks/${id}`,
        config: {
          method: 'PUT',
          data: patch,
        },
      }),
      invalidatesTags: (_result, _error, arg) => [{ type: 'Task', id: arg.id }],
    }),
    deleteTask: builder.mutation<void, string>({
      query: (id) => ({
        apiUrl: `/tasks/${id}`,
        config: { method: 'DELETE' },
      }),
      invalidatesTags: ['Task'],
    }),
  }),
});

export const {
  useGetTasksByProjectQuery,
  useGetTasksBacklogQuery,
  useGetTasksBySprintQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} = tasksApiSlice;
