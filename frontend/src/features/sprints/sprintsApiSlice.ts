import { apiSlice } from '../api/apiSlice';

export interface Sprint {
  id: string; // UUID
  projectId: string; // UUID
  epicId: string; // UUID
  name: string;
  goal?: string;
  startDate: string;
  endDate: string;
  status: string; // PLANNED, ACTIVE, CLOSED
  createdAt?: string;
  updatedAt?: string;
}

export type CreateSprintRequest = Omit<Sprint, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateSprintRequest = Partial<CreateSprintRequest> & { id: string };

export const sprintsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSprintsByProject: builder.query<Sprint[], string>({
      query: (projectId) => ({ apiUrl: `/sprints/project/${projectId}` }),
      providesTags: (result, _error, projectId) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Sprint' as const, id })),
              { type: 'Sprint', id: `LIST_PROJ_${projectId}` },
            ]
          : [{ type: 'Sprint', id: `LIST_PROJ_${projectId}` }],
    }),
    getSprintsByEpic: builder.query<Sprint[], string>({
      query: (epicId) => ({ apiUrl: `/sprints/epic/${epicId}` }),
      providesTags: (result, _error, epicId) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Sprint' as const, id })),
              { type: 'Sprint', id: `LIST_EPIC_${epicId}` },
            ]
          : [{ type: 'Sprint', id: `LIST_EPIC_${epicId}` }],
    }),
    createSprint: builder.mutation<Sprint, CreateSprintRequest>({
      query: (sprint) => ({
        apiUrl: '/sprints',
        config: {
          method: 'POST',
          data: sprint,
        },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Sprint', id: `LIST_PROJ_${arg.projectId}` },
        { type: 'Sprint', id: `LIST_EPIC_${arg.epicId}` }
      ],
    }),
    updateSprint: builder.mutation<Sprint, UpdateSprintRequest>({
      query: ({ id, ...patch }) => ({
        apiUrl: `/sprints/${id}`,
        config: {
          method: 'PUT',
          data: patch,
        },
      }),
      invalidatesTags: (_result, _error, arg) => [{ type: 'Sprint', id: arg.id }],
    }),
    deleteSprint: builder.mutation<void, string>({
      query: (id) => ({
        apiUrl: `/sprints/${id}`,
        config: { method: 'DELETE' },
      }),
      invalidatesTags: ['Sprint'],
    }),
  }),
});

export const {
  useGetSprintsByProjectQuery,
  useGetSprintsByEpicQuery,
  useCreateSprintMutation,
  useUpdateSprintMutation,
  useDeleteSprintMutation,
} = sprintsApiSlice;
