package com.ikon.taskmanagement.dto.request;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
public class WeeklyTimesheetRequestDto {
    private UUID projectId;
    private UUID teamMemberIds;
    private LocalDate startDate;
    private LocalDate endDate;
}