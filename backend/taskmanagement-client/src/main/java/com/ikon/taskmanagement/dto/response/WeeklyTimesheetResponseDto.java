package com.ikon.taskmanagement.dto.response;

import lombok.Data;

import java.util.Map;
import java.util.UUID;

@Data
public class WeeklyTimesheetResponseDto {

    private UUID teamMemberId;
    private Map<String, Double> dailyHours;
    private Double totalHours;
}