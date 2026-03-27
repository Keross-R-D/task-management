package com.ikon.taskmanagement.api;

import com.ikon.taskmanagement.dto.request.ProjectRequestDto;
import com.ikon.taskmanagement.dto.response.ProjectResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Project APIs", description = "APIs for managing Projects")
@RequestMapping("/api/projects")
public interface ProjectApi {

    @Operation(summary = "Create a new project")
    @PostMapping
    ResponseEntity<ProjectResponseDto> createProject(@RequestBody ProjectRequestDto projectDto);

    @Operation(summary = "Fetch all projects")
    @GetMapping
    ResponseEntity<List<ProjectResponseDto>> getAllProjects();

    @Operation(summary = "Fetch project by ID")
    @GetMapping("/{id}")
    ResponseEntity<ProjectResponseDto> getProjectById(@PathVariable("id") Long id);

    @Operation(summary = "Update an existing project")
    @PutMapping("/{id}")
    ResponseEntity<ProjectResponseDto> updateProject(@PathVariable("id") Long id, @RequestBody ProjectRequestDto projectDto);

    @Operation(summary = "Delete project by ID")
    @DeleteMapping("/{id}")
    ResponseEntity<Void> deleteProject(@PathVariable("id") Long id);
}
