package com.ikon.taskmanagement.api;

import com.ikon.taskmanagement.dto.request.TaskRequest;
import com.ikon.taskmanagement.dto.response.TaskResponse;
import com.ikon.taskmanagement.enums.TaskPriority;
import com.ikon.taskmanagement.enums.TaskStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Task Management", description = "APIs for managing tasks with CRUD operations")
@RequestMapping("/tasks")
public interface TaskApi {

    @Operation(summary = "Create a new task", description = "Creates a new task with the provided details")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Task created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input data")
    })
    @PostMapping
    ResponseEntity<TaskResponse> createTask(
            @RequestHeader("Authorization") String accessToken,
            @Valid @RequestBody TaskRequest request);

    @Operation(summary = "Get task by ID", description = "Retrieves a specific task by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Task found"),
            @ApiResponse(responseCode = "404", description = "Task not found")
    })
    @GetMapping("/{id}")
    ResponseEntity<TaskResponse> getTaskById(
            @RequestHeader("Authorization") String accessToken,
            @Parameter(description = "Task ID", required = true) @PathVariable Long id);

    @Operation(summary = "Get all tasks", description = "Retrieves all tasks with optional filtering by status, priority, or search term")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Tasks retrieved successfully")
    })
    @GetMapping
    ResponseEntity<List<TaskResponse>> getAllTasks(@RequestHeader("Authorization") String accessToken,
            @Parameter(description = "Filter by status") @RequestParam(required = false) TaskStatus status,
            @Parameter(description = "Filter by priority") @RequestParam(required = false) TaskPriority priority,
            @Parameter(description = "Search by title") @RequestParam(required = false) String search);

    @Operation(summary = "Get paginated tasks", description = "Retrieves tasks with pagination and optional filtering")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Tasks retrieved successfully with pagination")
    })
    @GetMapping("/paginated")
    ResponseEntity<Page<TaskResponse>> getTasksPaginated(
            @RequestHeader("Authorization") String accessToken,
            Pageable pageable,

            @Parameter(description = "Filter by status") @RequestParam(required = false) TaskStatus status,

            @Parameter(description = "Filter by priority") @RequestParam(required = false) TaskPriority priority,

            @Parameter(description = "Search by title") @RequestParam(required = false) String search);

    @Operation(summary = "Update a task", description = "Updates an existing task with new details")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Task updated successfully"),
            @ApiResponse(responseCode = "404", description = "Task not found"),
            @ApiResponse(responseCode = "400", description = "Invalid input data")
    })
    @PutMapping("/{id}")
    ResponseEntity<TaskResponse> updateTask(
            @RequestHeader("Authorization") String accessToken,
            @Parameter(description = "Task ID", required = true) @PathVariable Long id,
            @Valid @RequestBody TaskRequest request);

    @Operation(summary = "Delete a task", description = "Deletes a task by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Task deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Task not found")
    })
    @DeleteMapping("/{id}")
    ResponseEntity<Void> deleteTask(
            @RequestHeader("Authorization") String accessToken,
            @Parameter(description = "Task ID", required = true) @PathVariable Long id);
}