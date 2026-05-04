package com.ikon.taskmanagement.dto.response;

import lombok.Data;
import com.ikon.taskmanagement.enums.TaskStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class TaskResponseDto {
    private UUID id;
    private UUID projectId;
    private UUID epicId;
    private UUID sprintId;
    private String title;
    private String description;
    private String type;
    private TaskStatus status;
    private String priority;
    private UUID assigneeId;
    private UUID reporterId;
    private Double estimatedHours;
    private Double actualHours;
    private LocalDate startDate;
    private LocalDate endDate;
    private Double plannedDuration;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
