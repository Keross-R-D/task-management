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

export const userMap: Record<string, string> = {
    john: "550e8400-e29b-41d4-a716-446655440000",
    bob: "123e4567-e89b-12d3-a456-426614174000",
    alice: "987e6543-e21b-12d3-a456-426614174999",
};

const statusMap: Record<string, string> = {
    todo: "TO_DO",
    in_progress: "IN_PROGRESS",
    done: "DONE",
    blocked: "BLOCKED",
};

const mapUserToUUID = (user: string) => userMap[user];


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
                    assigneeId: data.assignee
                    ? mapUserToUUID(data.assignee)
                    : null,
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
                    assigneeId: data.assignee
                    ? mapUserToUUID(data.assignee)
                    : null,
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

export const { useGetMyTasksQuery, useUpdateMyTaskMutation, useUpdateMyTaskStatusMutation, useDeleteMyTaskMutation, useCreateMyTaskMutation } = mytasksApiSlice;