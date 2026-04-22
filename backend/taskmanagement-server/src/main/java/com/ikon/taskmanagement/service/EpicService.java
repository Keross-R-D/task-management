package com.ikon.taskmanagement.service;

import com.ikon.taskmanagement.dto.request.EpicRequestDto;
import com.ikon.taskmanagement.dto.response.EpicResponseDto;

import java.util.List;
import java.util.UUID;

public interface EpicService {
    EpicResponseDto createEpic(EpicRequestDto dto);
    List<EpicResponseDto> getEpicsByProjectId(UUID projectId);
    EpicResponseDto getEpicById(UUID id);
    EpicResponseDto updateEpic(UUID id, EpicRequestDto dto);
    void deleteEpic(UUID id);
}
