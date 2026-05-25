import { apiSlice } from "../api/apiSlice";
import { setToken } from "./authSlice";

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
  }),
});

export const { useLoginMutation } = authApiSlice;
