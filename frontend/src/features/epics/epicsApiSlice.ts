import { apiSlice } from "../api/apiSlice";

export interface Epic {
  id: number;
  name: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
  projectId: number; 
  createdAt: string;
  updatedAt: string;
}

export interface CreateEpicRequest {
  name: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
 projectId: string;
}

export const epicApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    getEpics: builder.query<Epic[], number | void>({
      query: (projectId) => ({
        apiUrl: projectId ? `/epics/project/${projectId}` : "/epics",
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Epic" as const, id })),
              { type: "Epic", id: "LIST" },
            ]
          : [{ type: "Epic", id: "LIST" }],
    }),

    createEpic: builder.mutation<Epic, CreateEpicRequest>({
      query: (epic) => ({
        apiUrl: "/epics",
        config: {
          method: "POST",
          data: epic,
        },
      }),
      invalidatesTags: [{ type: "Epic", id: "LIST" }],
    }),

  }),
});

export const {
  useGetEpicsQuery,
  useCreateEpicMutation,
} = epicApiSlice;