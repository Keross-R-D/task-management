package com.ikon.taskmanagement.dto.request;

import com.ikon.taskmanagement.enums.TaskStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateTaskStatusDto {

    @NotNull(message = "taskStatus is required")
    private TaskStatus taskStatus;
}