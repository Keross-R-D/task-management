package com.ikon.taskmanagement.api;

import com.ikon.taskmanagement.dto.request.MyTaskRequestDto;
import com.ikon.taskmanagement.dto.request.UpdateTaskStatusDto;
import com.ikon.taskmanagement.dto.response.MyTaskResponseDto;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestHeader;

@Tag(name = "My Task APIs", description = "APIs for managing My Tasks")
@RequestMapping("/api/myTasks")
public interface MyTaskApi {
        @Operation(summary = "Create My Task")
        @PostMapping
        ResponseEntity<MyTaskResponseDto> createMyTask(@RequestHeader("Authorization") String accessToken, @RequestBody MyTaskRequestDto myTaskDto);

        @Operation(summary = "Fetch all tasks")
        @GetMapping
        ResponseEntity<Page<MyTaskResponseDto>> getAllMyTasks(@RequestHeader("Authorization") String accessToken, Pageable pageable);

        @Operation(summary = "Fetch all tasks without pagination")
        @GetMapping("/all")
        ResponseEntity<List<MyTaskResponseDto>> getAllMyTasksList(@RequestHeader("Authorization") String accessToken);

        @Operation(summary = "Update an existing task")
        @PutMapping("/{id}")
        ResponseEntity<MyTaskResponseDto> updateMyTask(@RequestHeader("Authorization") String accessToken, @PathVariable("id") UUID id,
                        @RequestBody MyTaskRequestDto myTaskDto);

        @Operation(summary = "Update task status")
        @PatchMapping("/{id}")
        ResponseEntity<MyTaskResponseDto> updateTaskStatus(@RequestHeader("Authorization") String accessToken, 
                        @PathVariable("id") UUID id,
                        @RequestBody @Valid UpdateTaskStatusDto dto);

        @Operation(summary = "Delete a task")
        @DeleteMapping("/{id}")
        ResponseEntity<Void> deleteMyTask(@RequestHeader("Authorization") String accessToken, @PathVariable("id") UUID id);

}
