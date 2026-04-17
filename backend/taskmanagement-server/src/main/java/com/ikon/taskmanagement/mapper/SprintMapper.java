package com.ikon.taskmanagement.mapper;

import com.ikon.taskmanagement.dto.request.SprintRequestDto;
import com.ikon.taskmanagement.dto.response.SprintResponseDto;
import com.ikon.taskmanagement.entity.Sprint;
import org.springframework.stereotype.Component;

@Component
public class SprintMapper {

    public Sprint mapToEntity(SprintRequestDto dto) {
        if (dto == null) return null;
        Sprint entity = new Sprint();
        updateEntityFromDto(dto, entity);
        return entity;
    }

    public void updateEntityFromDto(SprintRequestDto dto, Sprint entity) {
        if (dto == null || entity == null) return;
        entity.setProjectId(dto.getProjectId());
        entity.setEpicId(dto.getEpicId());
        entity.setName(dto.getName());
        entity.setGoal(dto.getGoal());
        entity.setStartDate(dto.getStartDate());
        entity.setEndDate(dto.getEndDate());
        if (dto.getStatus() != null) entity.setStatus(dto.getStatus());
    }

    public SprintResponseDto mapToDto(Sprint entity) {
        if (entity == null) return null;
        SprintResponseDto dto = new SprintResponseDto();
        dto.setId(entity.getId());
        dto.setProjectId(entity.getProjectId());
        dto.setEpicId(entity.getEpicId());
        dto.setName(entity.getName());
        dto.setGoal(entity.getGoal());
        dto.setStartDate(entity.getStartDate());
        dto.setEndDate(entity.getEndDate());
        dto.setStatus(entity.getStatus());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }
}
