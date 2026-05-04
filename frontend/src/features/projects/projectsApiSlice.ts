import { apiSlice } from '../api/apiSlice';

export interface Project {
  id: number;
  projectName: string;
  clientName: string;
  managerId: string;
  startDate: string;
  endDate: string;
  projectStatus: string;
  type: string;
  teamMemberIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectRequest {
  projectName: string;
  clientName: string;
  managerId: string;
  startDate: string;
  endDate: string;
  projectStatus: string;
  type: string;
  teamMemberIds: string[];
}

export const projectsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProjects: builder.query<Project[], void>({
      query: () => ({ apiUrl: '/projects' }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Project' as const, id })),
              { type: 'Project', id: 'LIST' },
            ]
          : [{ type: 'Project', id: 'LIST' }],
    }),
    createProject: builder.mutation<Project, CreateProjectRequest>({
      query: (project) => ({
        apiUrl: '/projects',
        config: {
          method: 'POST',
          data: project,
        },
      }),
      invalidatesTags: [{ type: 'Project', id: 'LIST' }],
    }),
  }),
});

export const { useGetProjectsQuery, useCreateProjectMutation } = projectsApiSlice;
