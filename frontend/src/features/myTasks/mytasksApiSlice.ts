import { apiSlice } from "../api/apiSlice";

export interface Task {
    id: string;
    taskTitle: string;
    taskDescription: string;
    taskType: string;
    taskPriority: string;
    taskStatus: string;
    actualHours: number;
    estimatedHours: number;
    assigneeId: string;
    createdAt: string;
    updatedAt: string;
}

export interface TasksResponse {
    content: Task[];
    totalPages: number;
    totalElements: number
}

type CreateTaskPayload = {
    title: string;
    description?: string;
    type: string;
    priority: string;
    status: string;
    estimatedHours: number;
    assignee: string;
};



const statusMap: Record<string, string> = {
    todo: "TO_DO",
    in_progress: "IN_PROGRESS",
    done: "DONE",
    blocked: "BLOCKED",
};


export const mytasksApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getMyTasks: builder.query<TasksResponse, void>({
            query: () => ({ apiUrl: "/myTasks?sort=createdAt,asc" }),
            providesTags: (result) =>
                result
                    ? [
                        ...result.content.map(({ id }) => ({
                            type: "MyTask" as const,
                            id,
                        })),
                        { type: "MyTask", id: "LIST" },
                    ]
                    : [{ type: "MyTask", id: "LIST" }],
        }),
        getAllMyTasks: builder.query<Task[], void>({
            query: () => ({ apiUrl: "/myTasks/all" }),
            providesTags: (result) =>
                result
                    ? [
                        ...result.map(({ id }) => ({
                            type: "MyTask" as const,
                            id,
                        })),
                        { type: "MyTask", id: "LIST" },
                    ]
                    : [{ type: "MyTask", id: "LIST" }],
        }),
        // getTasks: builder.query<TasksResponse, { page: number; size: number }>({
        //     query: ({ page, size }) => ({
        //         apiUrl: `/myTasks?page=${page}&size=${size}`,
        //     }),
        //     providesTags: ["MyTask"],
        // }),
        createMyTask: builder.mutation<Task, CreateTaskPayload>({
            query: (data) => ({
                apiUrl: "/myTasks",
                config: {
                    method: "POST",
                    data: {
                        taskTitle: data.title,
                        taskDescription: data.description || "",
                        taskType: data.type.toUpperCase(),
                        taskPriority: data.priority.toUpperCase(),
                        taskStatus: statusMap[data.status],
                        estimatedHours: data.estimatedHours,
                        assigneeId: data.assignee || null,
                    },
                },
            }),
            invalidatesTags: ["MyTask"],
        }),
        updateMyTaskStatus: builder.mutation<Task,
            { id: string; status: string }>({
                query: ({ id, status }) => ({
                    apiUrl: `/myTasks/${id}`,
                    config: {
                        method: "PATCH",
                        data: {
                            taskStatus: status,
                        },
                    },
                }),
                invalidatesTags: ["MyTask"],
            }),
        updateMyTask: builder.mutation<Task, { id: string; data: CreateTaskPayload }>({
            query: ({ id, data }) => ({
                apiUrl: `/myTasks/${id}`,
                config: {
                    method: "PUT", // or PATCH (depends on backend)
                    data: {
                        taskTitle: data.title,
                        taskDescription: data.description || "",
                        taskType: data.type.toUpperCase(),
                        taskPriority: data.priority.toUpperCase(),
                        taskStatus: statusMap[data.status],
                        estimatedHours: data.estimatedHours,
                        assigneeId: data.assignee || null,
                    },
                },
            }),
            invalidatesTags: ["MyTask"],
        }),
        deleteMyTask: builder.mutation<void, string>({
            query: (id) => ({
                apiUrl: `/myTasks/${id}`,
                config: {
                    method: "DELETE",
                },
            }),
            invalidatesTags: ["MyTask"],
        }),
    }),
});

export const { useGetMyTasksQuery, useGetAllMyTasksQuery, useUpdateMyTaskMutation, useUpdateMyTaskStatusMutation, useDeleteMyTaskMutation, useCreateMyTaskMutation } = mytasksApiSlice;