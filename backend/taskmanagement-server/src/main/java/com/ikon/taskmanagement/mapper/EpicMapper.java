package com.ikon.taskmanagement.mapper;

import com.ikon.taskmanagement.dto.request.EpicRequestDto;
import com.ikon.taskmanagement.dto.response.EpicResponseDto;
import com.ikon.taskmanagement.entity.Epic;
import org.springframework.stereotype.Component;

@Component
public class EpicMapper {

    public Epic mapToEntity(EpicRequestDto dto) {
        if (dto == null) {
            return null;
        }
        Epic entity = new Epic();
        updateEntityFromDto(dto, entity);
        return entity;
    }

    public void updateEntityFromDto(EpicRequestDto dto, Epic entity) {
        if (dto == null || entity == null) {
            return;
        }
        entity.setProjectId(dto.getProjectId());
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setEpicNumber(dto.getEpicNumber());
        if (dto.getStatus() != null) {
            entity.setStatus(dto.getStatus());
        }
        entity.setStartDate(dto.getStartDate());
        entity.setEndDate(dto.getEndDate());
    }

    public EpicResponseDto mapToDto(Epic entity) {
        if (entity == null) {
            return null;
        }
        EpicResponseDto dto = new EpicResponseDto();
        dto.setId(entity.getId());
        dto.setProjectId(entity.getProjectId());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setStatus(entity.getStatus());
        dto.setStartDate(entity.getStartDate());
        dto.setEndDate(entity.getEndDate());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }
}
