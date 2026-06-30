import { apiSlice } from '../api/apiSlice';

export interface Epic {
  id: string; // UUID
  projectId: string; // UUID
  name: string;
  description?: string;
  status: string; // TODO, IN_PROGRESS, DONE
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateEpicRequest = Omit<Epic, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateEpicRequest = Partial<CreateEpicRequest> & { id: string };

export const epicsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getEpicsByProject: builder.query<Epic[], string>({
      query: (projectId) => ({ apiUrl: `/epics/project/${projectId}` }),
      providesTags: (result, _error, projectId) =>
        result
          ? [
            ...result.map(({ id }) => ({ type: 'Epic' as const, id })),
            { type: 'Epic', id: `LIST_${projectId}` },
          ]
          : [{ type: 'Epic', id: `LIST_${projectId}` }],
    }),
    createEpic: builder.mutation<Epic, CreateEpicRequest>({
      query: (epic) => ({
        apiUrl: '/epics',
        config: {
          method: 'POST',
          data: epic,
        },
      }),
      invalidatesTags: (_result, _error, arg) => [{ type: 'Epic', id: `LIST_${arg.projectId}` }],
    }),
    updateEpic: builder.mutation<Epic, UpdateEpicRequest>({
      query: ({ id, ...patch }) => ({
        apiUrl: `/epics/${id}`,
        config: {
          method: 'PUT',
          data: patch,
        },
      }),
      invalidatesTags: (_result, _error, arg) => [{ type: 'Epic', id: arg.id }],
    }),
    deleteEpic: builder.mutation<void, string>({
      query: (id) => ({
        apiUrl: `/epics/${id}`,
        config: { method: 'DELETE' },
      }),
      invalidatesTags: ['Epic'],
    }),
    triggerEpicSync: builder.mutation<{ status: string; message: string }, void>({
      query: () => ({
        apiUrl: '/sync/epics',
        config: {
          method: 'POST',
        },
      }),
    }),
  }),
});

export const {
  useGetEpicsByProjectQuery,
  useCreateEpicMutation,
  useUpdateEpicMutation,
  useDeleteEpicMutation,
  useTriggerEpicSyncMutation
} = epicsApiSlice;
