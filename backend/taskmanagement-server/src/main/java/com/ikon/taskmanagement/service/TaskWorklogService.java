package com.ikon.taskmanagement.service;

import com.ikon.taskmanagement.dto.request.TaskWorklogRequestDto;
import com.ikon.taskmanagement.dto.request.WeeklyTimesheetRequestDto;
import com.ikon.taskmanagement.dto.response.TaskWorklogResponseDto;
import com.ikon.taskmanagement.dto.response.WeeklyTimesheetResponseDto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface TaskWorklogService {
    TaskWorklogResponseDto createWorklog(TaskWorklogRequestDto dto);

    List<WeeklyTimesheetResponseDto> getWeeklyTimesheet(WeeklyTimesheetRequestDto dto);

    List<TaskWorklogResponseDto> getWorklogsByTaskId(UUID taskId);

    double getHoursByTaskUserAndDate(UUID taskId, UUID userId, LocalDate startDate, LocalDate endDate);

    List<TaskWorklogResponseDto> getWorklogsByTeamMemberId(UUID teamMemberId);

    TaskWorklogResponseDto getWorklogById(UUID id);

    TaskWorklogResponseDto updateWorklog(UUID id, TaskWorklogRequestDto dto);

    void deleteWorklog(UUID id);
}
