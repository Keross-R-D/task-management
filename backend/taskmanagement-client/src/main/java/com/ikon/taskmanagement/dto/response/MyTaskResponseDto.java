package com.ikon.taskmanagement.dto.response;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class MyTaskResponseDto {
    private UUID id;

    private String taskTitle;
    private String taskDescription;
    private String taskType;
    private String taskPriority;
    private String taskStatus;
    private Double estimatedHours;
    private Double actualHours;

    private UUID assigneeId;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
