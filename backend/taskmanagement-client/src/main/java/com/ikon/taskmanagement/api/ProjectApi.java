package com.ikon.taskmanagement.api;

import com.ikon.taskmanagement.dto.request.ProjectRequestDto;
import com.ikon.taskmanagement.dto.response.ProjectResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.List;
import java.util.UUID;

@Tag(name = "Project APIs", description = "APIs for managing Projects")
@RequestMapping("/api/projects")
public interface ProjectApi {

    @Operation(summary = "Create a new project")
    @PostMapping
    ResponseEntity<ProjectResponseDto> createProject(@RequestHeader("Authorization") String accessToken, @RequestBody ProjectRequestDto projectDto);

    @Operation(summary = "Fetch all projects")
    @GetMapping
    ResponseEntity<List<ProjectResponseDto>> getAllProjects(@RequestHeader("Authorization") String accessToken);

    @Operation(summary = "Fetch project by ID")
    @GetMapping("/{id}")
    ResponseEntity<ProjectResponseDto> getProjectById(@RequestHeader("Authorization") String accessToken, @PathVariable("id") UUID id);

    @Operation(summary = "Update an existing project")
    @PutMapping("/{id}")
    ResponseEntity<ProjectResponseDto> updateProject(@RequestHeader("Authorization") String accessToken, @PathVariable("id") UUID id,
            @RequestBody ProjectRequestDto projectDto);

    @Operation(summary = "Delete project by ID")
    @DeleteMapping("/{id}")
    ResponseEntity<Void> deleteProject(@RequestHeader("Authorization") String accessToken, @PathVariable("id") UUID id);
}
