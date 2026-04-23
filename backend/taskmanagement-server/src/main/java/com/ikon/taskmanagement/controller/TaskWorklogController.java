package com.ikon.taskmanagement.controller;

import com.ikon.taskmanagement.api.TaskWorklogApi;
import com.ikon.taskmanagement.dto.request.TaskWorklogRequestDto;
import com.ikon.taskmanagement.dto.request.WeeklyTimesheetRequestDto;
import com.ikon.taskmanagement.dto.response.TaskWorklogResponseDto;
import com.ikon.taskmanagement.dto.response.WeeklyTimesheetResponseDto;
import com.ikon.taskmanagement.service.TaskWorklogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class TaskWorklogController implements TaskWorklogApi {

    private final TaskWorklogService worklogService;

    @Override
    public ResponseEntity<TaskWorklogResponseDto> createWorklog(TaskWorklogRequestDto dto) {
        return ResponseEntity.ok(worklogService.createWorklog(dto));
    }

    @Override
    public ResponseEntity<List<WeeklyTimesheetResponseDto>> getWeeklyTimesheet(WeeklyTimesheetRequestDto dto) {
        return ResponseEntity.ok(worklogService.getWeeklyTimesheet(dto));
    }

    @Override
    public ResponseEntity<List<TaskWorklogResponseDto>> getWorklogsByTaskId(UUID taskId) {
        return ResponseEntity.ok(worklogService.getWorklogsByTaskId(taskId));
    }

    @Override
    public ResponseEntity<Double> getHoursByTaskUserAndDate(
            UUID taskId,
            UUID userId,
            LocalDate startDate,
            LocalDate endDate) {
        return ResponseEntity.ok(
                worklogService.getHoursByTaskUserAndDate(taskId, userId, startDate, endDate));
    }

    @Override
    public ResponseEntity<TaskWorklogResponseDto> getWorklogById(UUID id) {
        return ResponseEntity.ok(worklogService.getWorklogById(id));
    }

    @Override
    public ResponseEntity<TaskWorklogResponseDto> updateWorklog(UUID id, TaskWorklogRequestDto dto) {
        return ResponseEntity.ok(worklogService.updateWorklog(id, dto));
    }

    @Override
    public ResponseEntity<Void> deleteWorklog(UUID id) {
        worklogService.deleteWorklog(id);
        return ResponseEntity.noContent().build();
    }
}
