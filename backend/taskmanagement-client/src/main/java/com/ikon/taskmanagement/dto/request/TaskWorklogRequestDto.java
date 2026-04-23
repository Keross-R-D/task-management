package com.ikon.taskmanagement.dto.request;

import lombok.Data;
import java.util.Map;
import java.util.UUID;

@Data
public class TaskWorklogRequestDto {
    private UUID taskId;
    private UUID projectId;
    private Map<String, Double> hoursDistribution;
    private String description;
}   
