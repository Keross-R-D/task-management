package com.ikon.taskmanagement.dto.response;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Data
public class MyTaskWorklogResponseDto {
    private UUID id;
    private UUID myTaskId;
    private Map<String, Double> hoursDistribution;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}