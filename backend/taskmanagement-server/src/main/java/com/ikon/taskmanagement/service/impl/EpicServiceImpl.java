package com.ikon.taskmanagement.service.impl;

import com.ikon.taskmanagement.dto.request.EpicRequestDto;
import com.ikon.taskmanagement.dto.response.EpicResponseDto;
import com.ikon.taskmanagement.entity.Epic;
import com.ikon.taskmanagement.mapper.EpicMapper;
import com.ikon.taskmanagement.repository.EpicRepository;
import com.ikon.taskmanagement.service.EpicService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EpicServiceImpl implements EpicService {

    private final EpicRepository epicRepository;
    private final EpicMapper epicMapper;

    @Override
    public EpicResponseDto createEpic(EpicRequestDto dto) {
        Epic entity = epicMapper.mapToEntity(dto);
        Epic saved = epicRepository.save(entity);
        return epicMapper.mapToDto(saved);
    }

    @Override
    public List<EpicResponseDto> getEpicsByProjectId(UUID projectId) {
        return epicRepository.findByProjectId(projectId).stream()
                .map(epicMapper::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public EpicResponseDto getEpicById(UUID id) {
        Epic entity = epicRepository.findById(id).orElseThrow(() -> new RuntimeException("Epic not found"));
        return epicMapper.mapToDto(entity);
    }

    @Override
    public EpicResponseDto updateEpic(UUID id, EpicRequestDto dto) {
        Epic entity = epicRepository.findById(id).orElseThrow(() -> new RuntimeException("Epic not found"));
        epicMapper.updateEntityFromDto(dto, entity);
        Epic updated = epicRepository.save(entity);
        return epicMapper.mapToDto(updated);
    }

    @Override
    public void deleteEpic(UUID id) {
        epicRepository.deleteById(id);
    }
}
