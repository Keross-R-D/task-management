import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQueryWithReauth } from './axiosBaseQuery';

// Configure base query and inject endpoints later to avoid circular dependencies
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQueryWithReauth({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
  }),
  tagTypes: ['Project', 'Task', 'Epic', 'Sprint', 'Worklog', 'MyTask', 'MyTaskWorklog'],
  endpoints: () => ({}),
});

