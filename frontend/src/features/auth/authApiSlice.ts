import { apiSlice } from "../api/apiSlice";
import { setToken, setRolesAndGroups } from "./authSlice";

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        apiUrl: `${import.meta.env.VITE_IKON_API_URL}/platform/auth/login`,
        config: {
          method: "POST",
          data: credentials,
        }
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.accessToken) {
            dispatch(setToken(data));
          }
        } catch {
          // let component handle the UI error
        }
      },
    }),
    getCurrentUserRolesAndGroups: builder.query<{ roles: string[]; groups: string[] }, void>({
      query: () => ({
        apiUrl: `${import.meta.env.VITE_API_BASE_URL}/dac/current-user-app-role-group`,
        config: {
          method: "GET",
        },
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(setRolesAndGroups(data));
          }
        } catch {
          // handle error if needed
        }
      },
    }),
  }),
});

export const { useLoginMutation, useGetCurrentUserRolesAndGroupsQuery } = authApiSlice;
