package com.ikon.taskmanagement.service;

import com.ikon.taskmanagement.dto.request.ProjectRequestDto;
import com.ikon.taskmanagement.dto.response.ProjectResponseDto;

import java.util.List;
import java.util.UUID;

public interface ProjectService {
    ProjectResponseDto createProject(ProjectRequestDto projectDto);

    List<ProjectResponseDto> getAllProjects();

    ProjectResponseDto getProjectById(UUID id);

    ProjectResponseDto updateProject(UUID id, ProjectRequestDto projectDto);

    void deleteProject(UUID id);
}
