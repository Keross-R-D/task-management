package com.ikon.taskmanagement.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateTaskStatusDto {

    @NotNull(message = "taskStatus is required")
    private String taskStatus;
}