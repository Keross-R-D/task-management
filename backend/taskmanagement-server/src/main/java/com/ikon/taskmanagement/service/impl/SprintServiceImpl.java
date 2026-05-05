package com.ikon.taskmanagement.service.impl;

import com.ikon.taskmanagement.dto.request.SprintRequestDto;
import com.ikon.taskmanagement.dto.request.UpdateSprintStatusDto;
import com.ikon.taskmanagement.dto.response.SprintResponseDto;
import com.ikon.taskmanagement.entity.Sprint;
import com.ikon.taskmanagement.mapper.SprintMapper;
import com.ikon.taskmanagement.repository.SprintRepository;
import com.ikon.taskmanagement.service.SprintService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SprintServiceImpl implements SprintService {

    private final SprintRepository sprintRepository;
    private final SprintMapper sprintMapper;

    @Override
    public SprintResponseDto createSprint(SprintRequestDto dto) {
        Sprint entity = sprintMapper.mapToEntity(dto);
        Sprint saved = sprintRepository.save(entity);
        return sprintMapper.mapToDto(saved);
    }

    @Override
    public List<SprintResponseDto> getSprintsByEpicId(UUID epicId) {
        return sprintRepository.findByEpicId(epicId).stream()
                .map(sprintMapper::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<SprintResponseDto> getSprintsByProjectId(UUID projectId) {
        return sprintRepository.findByProjectId(projectId).stream()
                .map(sprintMapper::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public SprintResponseDto getSprintById(UUID id) {
        Sprint entity = sprintRepository.findById(id).orElseThrow(() -> new RuntimeException("Sprint not found"));
        return sprintMapper.mapToDto(entity);
    }

    @Override
    public SprintResponseDto updateSprint(UUID id, SprintRequestDto dto) {
        Sprint entity = sprintRepository.findById(id).orElseThrow(() -> new RuntimeException("Sprint not found"));
        sprintMapper.updateEntityFromDto(dto, entity);
        Sprint updated = sprintRepository.save(entity);
        return sprintMapper.mapToDto(updated);
    }

    @Override
    public SprintResponseDto patchSprintStatus(UUID id, UpdateSprintStatusDto dto) {
        Sprint entity = sprintRepository.findById(id).orElseThrow(() -> new RuntimeException("Sprint not found"));
        entity.setStatus(dto.getStatus());
        Sprint updated = sprintRepository.save(entity);
        return sprintMapper.mapToDto(updated);
    }

    @Override
    public void deleteSprint(UUID id) {
        sprintRepository.deleteById(id);
    }
}
