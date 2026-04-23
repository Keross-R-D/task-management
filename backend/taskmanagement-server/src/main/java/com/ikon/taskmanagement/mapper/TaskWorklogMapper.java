package com.ikon.taskmanagement.mapper;

import com.ikon.taskmanagement.dto.request.TaskWorklogRequestDto;
import com.ikon.taskmanagement.dto.response.TaskWorklogResponseDto;
import com.ikon.taskmanagement.entity.TaskWorklog;
import org.springframework.stereotype.Component;

import java.util.HashMap;

@Component
public class TaskWorklogMapper {

    public TaskWorklog mapToEntity(TaskWorklogRequestDto dto) {
        if (dto == null) return null;
        TaskWorklog entity = new TaskWorklog();
        updateEntityFromDto(dto, entity);
        return entity;
    }

    public void updateEntityFromDto(TaskWorklogRequestDto dto, TaskWorklog entity) {
        if (dto == null || entity == null) return;
        entity.setTaskId(dto.getTaskId());
        entity.setProjectId(dto.getProjectId());
        if (dto.getHoursDistribution() != null) {
            entity.setHoursDistribution(new HashMap<>(dto.getHoursDistribution()));
        }
        entity.setDescription(dto.getDescription());
    }

    public TaskWorklogResponseDto mapToDto(TaskWorklog entity) {
        if (entity == null) return null;
        TaskWorklogResponseDto dto = new TaskWorklogResponseDto();
        dto.setId(entity.getId());
        dto.setTaskId(entity.getTaskId());
        dto.setProjectId(entity.getProjectId());
        if (entity.getHoursDistribution() != null) {
            dto.setHoursDistribution(new HashMap<>(entity.getHoursDistribution()));
        }
        dto.setDescription(entity.getDescription());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }
}
