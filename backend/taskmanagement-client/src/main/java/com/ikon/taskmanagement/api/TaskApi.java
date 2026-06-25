package com.ikon.taskmanagement.api;

import com.ikon.taskmanagement.dto.request.TaskRequestDto;
import com.ikon.taskmanagement.dto.request.UpdateTaskStatusDto;
import com.ikon.taskmanagement.dto.response.TaskResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.List;
import java.util.UUID;

@Tag(name = "Task APIs", description = "APIs for managing Tasks")
@RequestMapping("/api/tasks")
public interface TaskApi {

    @Operation(summary = "Fetch all tasks without access criteria")
    @GetMapping
    ResponseEntity<List<TaskResponseDto>> getAllTasks(@RequestHeader("Authorization") String accessToken);

    @Operation(summary = "Create a new task")
    @PostMapping
    ResponseEntity<TaskResponseDto> createTask(@RequestHeader("Authorization") String accessToken, @RequestBody TaskRequestDto dto);

    @Operation(summary = "Fetch tasks by Project ID")
    @GetMapping("/project/{projectId}")
    ResponseEntity<List<TaskResponseDto>> getTasksByProjectId(@RequestHeader("Authorization") String accessToken, @PathVariable("projectId") UUID projectId);

    @Operation(summary = "Fetch tasks by Epic ID")
    @GetMapping("/epic/{epicId}")
    ResponseEntity<List<TaskResponseDto>> getTasksByEpicId(@RequestHeader("Authorization") String accessToken, @PathVariable("epicId") UUID epicId);

    @Operation(summary = "Fetch tasks by Sprint ID")
    @GetMapping("/sprint/{sprintId}")
    ResponseEntity<List<TaskResponseDto>> getTasksBySprintId(@RequestHeader("Authorization") String accessToken, @PathVariable("sprintId") UUID sprintId);

    @Operation(summary = "Fetch project backlog (tasks unassigned to sprint)")
    @GetMapping("/project/{projectId}/backlog")
    ResponseEntity<List<TaskResponseDto>> getProjectBacklog(@RequestHeader("Authorization") String accessToken, @PathVariable("projectId") UUID projectId);

    @Operation(summary = "Fetch task by ID")
    @GetMapping("/{id}")
    ResponseEntity<TaskResponseDto> getTaskById(@RequestHeader("Authorization") String accessToken, @PathVariable("id") UUID id);

    @Operation(summary = "Update an existing task")
    @PutMapping("/{id}")
    ResponseEntity<TaskResponseDto> updateTask(@RequestHeader("Authorization") String accessToken, @PathVariable("id") UUID id, @RequestBody TaskRequestDto dto);

    @Operation(summary = "Delete task by ID")
    @DeleteMapping("/{id}")
    ResponseEntity<Void> deleteTask(@RequestHeader("Authorization") String accessToken, @PathVariable("id") UUID id);

    @Operation(summary = "Update task status")
    @PatchMapping("/{id}/status")
    ResponseEntity<TaskResponseDto> patchTaskStatus(@RequestHeader("Authorization") String accessToken, @PathVariable("id") UUID id, @RequestBody UpdateTaskStatusDto dto);
}
