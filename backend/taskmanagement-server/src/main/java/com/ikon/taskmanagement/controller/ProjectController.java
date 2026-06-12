package com.ikon.taskmanagement.controller;

import com.ikon.taskmanagement.api.ProjectApi;
import com.ikon.taskmanagement.dto.request.ProjectRequestDto;
import com.ikon.taskmanagement.dto.response.ProjectResponseDto;
import com.ikon.taskmanagement.service.ProjectService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.List;
import java.util.UUID;

import com.ikon.dac.annotation.RequireRole;

@RestController
public class ProjectController implements ProjectApi {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @Override
    @RequireRole("Task Manager")
    public ResponseEntity<ProjectResponseDto> createProject(@RequestHeader("Authorization") String accessToken,
            ProjectRequestDto projectDto) {
        return new ResponseEntity<>(projectService.createProject(projectDto), HttpStatus.CREATED);
    }

    @Override
    public ResponseEntity<List<ProjectResponseDto>> getAllProjects(@RequestHeader("Authorization") String accessToken) {
        return ResponseEntity.ok(projectService.getAllProjects());
    }

    @Override
    public ResponseEntity<ProjectResponseDto> getProjectById(@RequestHeader("Authorization") String accessToken,
            UUID id) {
        return ResponseEntity.ok(projectService.getProjectById(id));
    }

    @Override
    @RequireRole("Task Manager")
    public ResponseEntity<ProjectResponseDto> updateProject(@RequestHeader("Authorization") String accessToken, UUID id,
            ProjectRequestDto projectDto) {
        return ResponseEntity.ok(projectService.updateProject(id, projectDto));
    }

    @Override
    @RequireRole("Task Manager")
    public ResponseEntity<Void> deleteProject(@RequestHeader("Authorization") String accessToken, UUID id) {
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }
}
