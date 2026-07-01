package com.ikon.taskmanagement.api;

import com.ikon.taskmanagement.dto.request.TaskWorklogRequestDto;
import com.ikon.taskmanagement.dto.response.TaskWorklogDetailsResponseDto;
import com.ikon.taskmanagement.dto.response.TaskWorklogResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "Task Worklog APIs", description = "APIs for logging time on Tasks")
@RequestMapping("/api/worklogs")
public interface TaskWorklogApi {

    @Operation(summary = "Create a new worklog")
    @PostMapping
    ResponseEntity<TaskWorklogResponseDto> createWorklog(@RequestHeader("Authorization") String accessToken, @RequestBody TaskWorklogRequestDto dto);

    @Operation(summary = "Fetch all task worklogs")
    @GetMapping
    ResponseEntity<List<TaskWorklogDetailsResponseDto>> getAllTaskWorklogs(@RequestHeader("Authorization") String accessToken);

    @Operation(summary = "Fetch worklogs by Task ID")
    @GetMapping("/task/{taskId}")
    ResponseEntity<List<TaskWorklogResponseDto>> getWorklogsByTaskId(@RequestHeader("Authorization") String accessToken, @PathVariable("taskId") UUID taskId);

    @Operation(summary = "Fetch worklog by ID")
    @GetMapping("/{id}")
    ResponseEntity<TaskWorklogResponseDto> getWorklogById(@RequestHeader("Authorization") String accessToken, @PathVariable("id") UUID id);

    @Operation(summary = "Update a worklog")
    @PutMapping("/{id}")
    ResponseEntity<TaskWorklogResponseDto> updateWorklog(@RequestHeader("Authorization") String accessToken, @PathVariable("id") UUID id,
            @RequestBody TaskWorklogRequestDto dto);

    @Operation(summary = "Delete a worklog")
    @DeleteMapping("/{id}")
    ResponseEntity<Void> deleteWorklog(@RequestHeader("Authorization") String accessToken, @PathVariable("id") UUID id);

    @Operation(summary = "Fetch all worklogs for a project")
    @GetMapping("/project/{projectId}")
    ResponseEntity<List<TaskWorklogResponseDto>> getWorklogsByProjectId(@RequestHeader("Authorization") String accessToken, @PathVariable("projectId") UUID projectId);
}
