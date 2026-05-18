import { apiSlice } from "../api/apiSlice";

export interface MyTaskWorklog {
    id: string; // UUID
    myTaskId: string; // UUID
    hoursDistribution: Record<string, number>;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
}

export type CreateMyTaskWorklogRequest = Omit<
    MyTaskWorklog,
    "id" | "createdAt" | "updatedAt"
>;

export type UpdateMyTaskWorklogRequest = Partial<CreateMyTaskWorklogRequest> & {
    id: string;
    myTaskId: string
};

export const myTaskWorklogsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({

        getAllMyTaskWorklogs: builder.query<MyTaskWorklog[], void>({
            query: () => ({ apiUrl: "/myTaskWorklogs" }),
            providesTags: (result) =>
                result
                    ? [
                        ...result.map(({ id }) => ({ type: "MyTaskWorklog" as const, id })),
                        { type: "MyTaskWorklog", id: "LIST" },
                    ]
                    : [{ type: "MyTaskWorklog", id: "LIST" }],
        }),

        getWorklogsByMyTask: builder.query<MyTaskWorklog[], string>({
            query: (myTaskId) => ({ apiUrl: `/myTaskWorklogs/task/${myTaskId}` }),
            providesTags: (result, _error, myTaskId) =>
                result
                    ? [
                        ...result.map(({ id }) => ({ type: "MyTaskWorklog" as const, id })),
                        { type: "MyTaskWorklog", id: `LIST_MYTASK_${myTaskId}` },
                    ]
                    : [{ type: "MyTaskWorklog", id: `LIST_MYTASK_${myTaskId}` }],
        }),

        createMyTaskWorklog: builder.mutation<MyTaskWorklog, CreateMyTaskWorklogRequest>({
            query: (worklog) => ({
                apiUrl: "/myTaskWorklogs",
                config: {
                    method: "POST",
                    data: worklog,
                },
            }),
            invalidatesTags: (_result, _error, arg) => [
                { type: "MyTaskWorklog", id: `LIST_MYTASK_${arg.myTaskId}` },
                { type: "MyTask", id: arg.myTaskId },
                { type: "MyTask", id: "LIST" },
            ],
        }),

        updateMyTaskWorklog: builder.mutation<MyTaskWorklog, UpdateMyTaskWorklogRequest>({
            query: ({ id, ...patch }) => ({
                apiUrl: `/myTaskWorklogs/${id}`,
                config: {
                    method: "PUT",
                    data: patch,
                },
            }),
            invalidatesTags: (_result, _error, arg) => [
                { type: "MyTaskWorklog", id: arg.id },
                { type: "MyTaskWorklog", id: `LIST_MYTASK_${arg.myTaskId}` },
                { type: "MyTask", id: arg.myTaskId },
                { type: "MyTask", id: "LIST" },
            ],
        }),

        deleteMyTaskWorklog: builder.mutation<void, { id: string; myTaskId: string }>({
            query: ({ id }) => ({
                apiUrl: `/myTaskWorklogs/${id}`,
                config: { method: "DELETE" },
            }),
            invalidatesTags: (_result, _error, arg) => [
                { type: "MyTaskWorklog", id: `LIST_MYTASK_${arg.myTaskId}` },
                { type: "MyTask", id: arg.myTaskId },
                { type: "MyTask", id: "LIST" },
            ]
        }),
    }),
});

export const {
    useGetAllMyTaskWorklogsQuery,
    useGetWorklogsByMyTaskQuery,
    useCreateMyTaskWorklogMutation,
    useUpdateMyTaskWorklogMutation,
    useDeleteMyTaskWorklogMutation,
} = myTaskWorklogsApiSlice;