package com.ikon.taskmanagement.api;

import com.ikon.taskmanagement.dto.request.TaskWorklogRequestDto;
import com.ikon.taskmanagement.dto.request.WeeklyTimesheetRequestDto;
import com.ikon.taskmanagement.dto.response.TaskWorklogResponseDto;
import com.ikon.taskmanagement.dto.response.WeeklyTimesheetResponseDto;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Tag(name = "Task Worklog APIs", description = "APIs for logging time on Tasks")
@RequestMapping("/api/worklogs")
public interface TaskWorklogApi {

        @Operation(summary = "Create a new worklog")
        @PostMapping
        ResponseEntity<TaskWorklogResponseDto> createWorklog(@RequestBody TaskWorklogRequestDto dto);

        @Operation(summary = "Get weekly timesheet matrix (assignee × date)")
        @PostMapping("/timesheet/weekly")
        ResponseEntity<List<WeeklyTimesheetResponseDto>> getWeeklyTimesheet(
                        @RequestBody WeeklyTimesheetRequestDto request);

        @Operation(summary = "Fetch worklogs by Task ID")
        @GetMapping("/task/{taskId}")
        ResponseEntity<List<TaskWorklogResponseDto>> getWorklogsByTaskId(@PathVariable("taskId") UUID taskId);

        @Operation(summary = "Get total hours by Task, User and Date")
        @GetMapping("/hours")
        ResponseEntity<Double> getHoursByTaskUserAndDate(
                        @RequestParam UUID taskId,
                        @RequestParam UUID userId,
                        @RequestParam LocalDate startDate,
                        @RequestParam LocalDate endDate);

        @Operation(summary = "Fetch worklog by ID")
        @GetMapping("/{id}")
        ResponseEntity<TaskWorklogResponseDto> getWorklogById(@PathVariable("id") UUID id);

        @Operation(summary = "Update a worklog")
        @PutMapping("/{id}")
        ResponseEntity<TaskWorklogResponseDto> updateWorklog(@PathVariable("id") UUID id,
                        @RequestBody TaskWorklogRequestDto dto);

        @Operation(summary = "Delete a worklog")
        @DeleteMapping("/{id}")
        ResponseEntity<Void> deleteWorklog(@PathVariable("id") UUID id);
}
