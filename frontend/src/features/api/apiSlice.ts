import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";

// The library's axiosInstance handles token attach/refresh/logout,
// so we use the simple axiosBaseQuery (no reauth wrapper needed).
export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
  }),
  tagTypes: [
    "Project",
    "Task",
    "Epic",
    "Sprint",
    "Worklog",
    "MyTask",
    "MyTaskWorklog",
  ],
  endpoints: () => ({}),
});
