package com.ikon.taskmanagement.dto.request;

import lombok.Data;
import java.util.Map;
import java.util.UUID;

@Data
public class MyTaskWorklogRequestDto {
    private UUID myTaskId;
    private Map<String, Double> hoursDistribution;
    private String description;
}