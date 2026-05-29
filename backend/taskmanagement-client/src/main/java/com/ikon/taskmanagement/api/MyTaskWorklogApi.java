package com.ikon.taskmanagement.api;

import com.ikon.taskmanagement.dto.request.MyTaskWorklogRequestDto;
import com.ikon.taskmanagement.dto.response.MyTaskWorklogResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.List;
import java.util.UUID;

@Tag(name = "My Task Worklog APIs", description = "APIs for managing My Task Worklogs")
@RequestMapping("/api/myTaskWorklogs")
public interface MyTaskWorklogApi {

    @Operation(summary = "Create worklog")
    @PostMapping
    ResponseEntity<MyTaskWorklogResponseDto> createWorklog(@RequestHeader("Authorization") String accessToken, @RequestBody MyTaskWorklogRequestDto dto);

    @Operation(summary = "Fetch all worklogs")
    @GetMapping
    ResponseEntity<List<MyTaskWorklogResponseDto>> getAllWorklogs(@RequestHeader("Authorization") String accessToken);

    @Operation(summary = "Get worklogs by MyTask ID")
    @GetMapping("/task/{myTaskId}")
    ResponseEntity<List<MyTaskWorklogResponseDto>> getWorklogsByMyTaskId(@RequestHeader("Authorization") String accessToken, @PathVariable UUID myTaskId);

    @Operation(summary = "Get worklog by ID")
    @GetMapping("/{id}")
    ResponseEntity<MyTaskWorklogResponseDto> getWorklogById(@RequestHeader("Authorization") String accessToken, @PathVariable UUID id);

    @Operation(summary = "Update worklog")
    @PutMapping("/{id}")
    ResponseEntity<MyTaskWorklogResponseDto> updateWorklog(@RequestHeader("Authorization") String accessToken, @PathVariable UUID id, @RequestBody MyTaskWorklogRequestDto dto);

    @Operation(summary = "Delete worklog")
    @DeleteMapping("/{id}")
    ResponseEntity<Void> deleteWorklog(@RequestHeader("Authorization") String accessToken, @PathVariable UUID id);
}