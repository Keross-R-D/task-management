import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQueryWithReauth } from './axiosBaseQuery';

// Configure base query and inject endpoints later to avoid circular dependencies
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQueryWithReauth({ baseUrl: 'http://localhost:8071/api' }), // Pointing local Spring Boot App Port 8071
  tagTypes: ['Project', 'Task', 'Epic', 'Sprint', 'Worklog', 'MyTask', 'MyTaskWorklog'],
  endpoints: () => ({}),
});
