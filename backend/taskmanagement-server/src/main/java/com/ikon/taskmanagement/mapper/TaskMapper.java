package com.ikon.taskmanagement.mapper;

import com.ikon.taskmanagement.dto.request.TaskRequestDto;
import com.ikon.taskmanagement.dto.response.TaskResponseDto;
import com.ikon.taskmanagement.entity.Task;
import org.springframework.stereotype.Component;

@Component
public class TaskMapper {

    public Task mapToEntity(TaskRequestDto dto) {
        if (dto == null) return null;
        Task entity = new Task();
        updateEntityFromDto(dto, entity);
        return entity;
    }

    public void updateEntityFromDto(TaskRequestDto dto, Task entity) {
        if (dto == null || entity == null) return;
        entity.setProjectId(dto.getProjectId());
        entity.setEpicId(dto.getEpicId());
        entity.setSprintId(dto.getSprintId());
        entity.setTitle(dto.getTitle());
        entity.setDescription(dto.getDescription());
        if (dto.getType() != null) entity.setType(dto.getType());
        if (dto.getStatus() != null) entity.setStatus(dto.getStatus());
        if (dto.getPriority() != null) entity.setPriority(dto.getPriority());
        entity.setAssigneeId(dto.getAssigneeId());
        entity.setReporterId(dto.getReporterId());
        entity.setEstimatedHours(dto.getEstimatedHours());
        entity.setStartDate(dto.getStartDate());
        entity.setEndDate(dto.getEndDate());
        entity.setPlannedDuration(dto.getPlannedDuration());
    }

    public TaskResponseDto mapToDto(Task entity) {
        if (entity == null) return null;
        TaskResponseDto dto = new TaskResponseDto();
        dto.setId(entity.getId());
        dto.setProjectId(entity.getProjectId());
        dto.setEpicId(entity.getEpicId());
        dto.setSprintId(entity.getSprintId());
        dto.setTitle(entity.getTitle());
        dto.setDescription(entity.getDescription());
        dto.setType(entity.getType());
        dto.setStatus(entity.getStatus());
        dto.setPriority(entity.getPriority());
        dto.setAssigneeId(entity.getAssigneeId());
        dto.setReporterId(entity.getReporterId());
        dto.setEstimatedHours(entity.getEstimatedHours());
        dto.setActualHours(entity.getActualHours());
        dto.setStartDate(entity.getStartDate());
        dto.setEndDate(entity.getEndDate());
        dto.setPlannedDuration(entity.getPlannedDuration());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }
}
