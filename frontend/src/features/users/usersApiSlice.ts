import { apiSlice } from "../api/apiSlice";

export interface User {
  userId: string;
  userName: string;
  userLogin: string;
  userEmail: string;
  userDesignation?: string;
  active: boolean;
}

export interface Role {
  roleId: string;
  roleName: string;
  roleDescription: string;
  active: boolean;
}

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      query: () => ({
        // Absolute URL bypasses the default localhost baseUrl
        apiUrl: "https://ikoncloud-dev.keross.com/ikon-api/platform/user/current",
      }),
      providesTags: ["User"] as any,
    }),
    getRoles: builder.query<Role[], void>({
      query: () => ({
        // Relative URL uses the default baseUrl (http://localhost:8071/api)
        apiUrl: "/role",
      }),
      providesTags: ["Role"] as any,
    }),
  }),
});

export const { useGetUsersQuery, useGetRolesQuery } = usersApiSlice;
