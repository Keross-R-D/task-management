package com.ikon.taskmanagement.dto.request;

import lombok.Data;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class BulkTaskUploadRequestDto {

    private UUID projectId;
    private UUID epicId;
   
    private String sprintName;
    private String sprintGoal;
    private String sprintStatus;
    private LocalDate sprintStartDate;
    private LocalDate sprintEndDate;

    private String title;
    private String description;
    private String type;
    private String status;
    private String priority;
    private UUID assigneeId;
    private UUID reporterId;
    private Double estimatedHours;
    private LocalDate startDate;
    private LocalDate endDate;
    private Double plannedDuration;
}