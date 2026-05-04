package com.ikon.taskmanagement.dto.request;

import lombok.Data;
import com.ikon.taskmanagement.enums.TaskStatus;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class TaskRequestDto {
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
    private LocalDate startDate;
    private LocalDate endDate;
    private Double plannedDuration;
}
