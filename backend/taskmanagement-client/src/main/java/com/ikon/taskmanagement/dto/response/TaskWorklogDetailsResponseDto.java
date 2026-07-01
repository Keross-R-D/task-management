package com.ikon.taskmanagement.dto.response;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

import com.ikon.taskmanagement.enums.TaskStatus;

import lombok.Data;

@Data
public class TaskWorklogDetailsResponseDto {

    // Task fields
    private UUID taskId;
    private UUID projectId;
    private String title;
    private TaskStatus status;
    private UUID assigneeId;

    // Worklog fields
    private UUID worklogId;
    private Map<String, Double> hoursDistribution;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
