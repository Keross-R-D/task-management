package com.ikon.taskmanagement.dto.request;

import lombok.Data;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

@Data
public class TaskWorklogRequestDto {
    private UUID taskId;
    private UUID projectId;
    private UUID teamMemberId;
    private LocalDate startDate;
    private LocalDate endDate;
    private Double totalHours;
    private Map<String, Double> hoursDistribution;
    private String description;
}
