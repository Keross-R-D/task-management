package com.ikon.taskmanagement.mapper;

import com.ikon.taskmanagement.dto.request.MyTaskWorklogRequestDto;
import com.ikon.taskmanagement.dto.response.MyTaskWorklogResponseDto;
import com.ikon.taskmanagement.entity.MyTaskWorklog;
import org.springframework.stereotype.Component;

import java.util.HashMap;

@Component
public class MyTaskWorklogMapper {

    public MyTaskWorklog mapToEntity(MyTaskWorklogRequestDto dto) {
        if (dto == null)
            return null;

        MyTaskWorklog entity = new MyTaskWorklog();
        updateEntityFromDto(dto, entity);
        return entity;
    }

    public void updateEntityFromDto(MyTaskWorklogRequestDto dto, MyTaskWorklog entity) {
        if (dto == null || entity == null)
            return;

        entity.setMyTaskId(dto.getMyTaskId());

        if (dto.getHoursDistribution() != null) {
            entity.setHoursDistribution(new HashMap<>(dto.getHoursDistribution()));
        }

        entity.setDescription(dto.getDescription());
    }

    public MyTaskWorklogResponseDto mapToDto(MyTaskWorklog entity) {
        if (entity == null)
            return null;

        MyTaskWorklogResponseDto dto = new MyTaskWorklogResponseDto();

        dto.setId(entity.getId());
        dto.setMyTaskId(entity.getMyTaskId());

        if (entity.getHoursDistribution() != null) {
            dto.setHoursDistribution(new HashMap<>(entity.getHoursDistribution()));
        }

        dto.setDescription(entity.getDescription());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());

        return dto;
    }
}