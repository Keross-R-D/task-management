package com.ikon.taskmanagement.service.impl;

import com.ikon.taskmanagement.dto.request.ProjectRequestDto;
import com.ikon.taskmanagement.dto.response.ProjectResponseDto;
import com.ikon.taskmanagement.entity.Project;
import com.ikon.taskmanagement.mapper.ProjectMapper;
import com.ikon.taskmanagement.repository.ProjectRepository;
import com.ikon.taskmanagement.service.ProjectService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMapper projectMapper;

    public ProjectServiceImpl(ProjectRepository projectRepository, ProjectMapper projectMapper) {
        this.projectRepository = projectRepository;
        this.projectMapper = projectMapper;
    }

    @Override
    public ProjectResponseDto createProject(ProjectRequestDto projectDto) {
        Project project = projectMapper.mapToEntity(projectDto);
        Project savedProject = projectRepository.save(project);
        return projectMapper.mapToDto(savedProject);
    }

    @Override
    public List<ProjectResponseDto> getAllProjects() {
        return projectRepository.findAll().stream()
                .map(projectMapper::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public ProjectResponseDto getProjectById(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));
        return projectMapper.mapToDto(project);
    }

    @Override
    public ProjectResponseDto updateProject(Long id, ProjectRequestDto projectDto) {
        Project existingProject = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));

        projectMapper.updateEntityFromDto(projectDto, existingProject);

        Project updatedProject = projectRepository.save(existingProject);
        return projectMapper.mapToDto(updatedProject);
    }

    @Override
    public void deleteProject(Long id) {
        projectRepository.deleteById(id);
    }
}
