package com.ikon.taskmanagement.mapper;

import com.ikon.taskmanagement.dto.request.ProjectRequestDto;
import com.ikon.taskmanagement.dto.response.ProjectResponseDto;
import com.ikon.taskmanagement.entity.Project;

import java.util.UUID;

import org.springframework.stereotype.Component;

@Component
public class ProjectMapper {

    public Project mapToEntity(ProjectRequestDto dto) {
        if (dto == null) {
            return null;
        }
        Project project = new Project();
        project.setId(dto.getId() != null ? dto.getId() : UUID.randomUUID());
        updateEntityFromDto(dto, project);
        return project;
    }

    public void updateEntityFromDto(ProjectRequestDto dto, Project project) {
        if (dto == null || project == null) {
            return;
        }
        project.setProjectName(dto.getProjectName());
        project.setClientName(dto.getClientName());
        project.setManagerId(dto.getManagerId());
        project.setManagerDelegateId(dto.getManagerDelegateId());
        project.setStartDate(dto.getStartDate());
        project.setEndDate(dto.getEndDate());
        project.setProjectStatus(dto.getProjectStatus());
        if (dto.getType() != null) {
            project.setType(dto.getType());
        }
        project.setTeamMemberIds(dto.getTeamMemberIds());
    }

    public ProjectResponseDto mapToDto(Project project) {
        if (project == null) {
            return null;
        }
        ProjectResponseDto dto = new ProjectResponseDto();
        dto.setId(project.getId());
        dto.setProjectName(project.getProjectName());
        dto.setClientName(project.getClientName());
        dto.setManagerId(project.getManagerId());
        dto.setManagerDelegateId(project.getManagerDelegateId());
        dto.setStartDate(project.getStartDate());
        dto.setEndDate(project.getEndDate());
        dto.setProjectStatus(project.getProjectStatus());
        dto.setType(project.getType());
        dto.setTeamMemberIds(project.getTeamMemberIds());
        dto.setCreatedAt(project.getCreatedAt());
        dto.setUpdatedAt(project.getUpdatedAt());
        return dto;
    }
}
