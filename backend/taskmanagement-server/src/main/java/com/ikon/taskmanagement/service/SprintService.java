package com.ikon.taskmanagement.service;

import com.ikon.taskmanagement.dto.request.SprintRequestDto;
import com.ikon.taskmanagement.dto.response.SprintResponseDto;

import java.util.List;
import java.util.UUID;

public interface SprintService {
    SprintResponseDto createSprint(SprintRequestDto dto);
    List<SprintResponseDto> getSprintsByEpicId(UUID epicId);
    List<SprintResponseDto> getSprintsByProjectId(UUID projectId);
    SprintResponseDto getSprintById(UUID id);
    SprintResponseDto updateSprint(UUID id, SprintRequestDto dto);
    void deleteSprint(UUID id);
}
