package com.ikon.taskmanagement.dto.response;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class MyTaskResponseDto {
    private Long id;

    private String taskTitle;
    private String taskDescription;
    private String taskType;
    private String taskPriority;
    private String taskStatus;
    private Integer estimatedHours;

    private List<UUID> assigneeIds;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
