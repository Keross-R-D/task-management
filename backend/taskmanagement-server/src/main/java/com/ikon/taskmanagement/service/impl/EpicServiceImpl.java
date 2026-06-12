package com.ikon.taskmanagement.service.impl;

import com.ikon.taskmanagement.dto.request.EpicRequestDto;
import com.ikon.taskmanagement.dto.response.EpicResponseDto;
import com.ikon.taskmanagement.entity.Epic;
import com.ikon.taskmanagement.mapper.EpicMapper;
import com.ikon.taskmanagement.repository.EpicRepository;
import com.ikon.taskmanagement.service.EpicService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import com.ikon.dac.core.AccessCriteria;
import com.ikon.dac.core.DataAccessFilter;
import com.ikon.taskmanagement.entity.Project;

@Service
@RequiredArgsConstructor
public class EpicServiceImpl implements EpicService {

    private final EpicRepository epicRepository;
    private final EpicMapper epicMapper;
    private final DataAccessFilter dataAccessFilter;

    @Override
    public EpicResponseDto createEpic(EpicRequestDto dto) {
        Epic entity = epicMapper.mapToEntity(dto);
        AccessCriteria projectCriteria = AccessCriteria.builder().allowedRoles(Set.of("Task Manager")).dynamicGroupsField("writeGroups").build();
        Project project = dataAccessFilter.findById(Project.class, entity.getProjectId(), projectCriteria)
                .orElseThrow(() -> new RuntimeException("Not authorized to create epic for this project"));

        String teamMemberGroup = "TeamMember_" + project.getId();
        String pmGroup = "ProjectManager_" + project.getId();
        String delegateGroup = "ManagerDelegate_" + project.getId();

        entity.setReadGroups(new HashSet<>(Set.of(teamMemberGroup, pmGroup, delegateGroup)));
        entity.setWriteGroups(new HashSet<>(Set.of(pmGroup, delegateGroup)));

        Epic saved = epicRepository.save(entity);
        return epicMapper.mapToDto(saved);
    }

    @Override
    public List<EpicResponseDto> getEpicsByProjectId(UUID projectId) {
        AccessCriteria readCriteria = AccessCriteria.builder().allowedRoles(Set.of("Task Manager")).dynamicGroupsField("readGroups").build();
        return dataAccessFilter.findAll(Epic.class, readCriteria).stream()
                .filter(epic -> epic.getProjectId().equals(projectId))
                .map(epicMapper::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public EpicResponseDto getEpicById(UUID id) {
        AccessCriteria readCriteria = AccessCriteria.builder().allowedRoles(Set.of("Task Manager")).dynamicGroupsField("readGroups").build();
        Epic entity = dataAccessFilter.findById(Epic.class, id, readCriteria)
                .orElseThrow(() -> new RuntimeException("Epic not found or access denied"));
        return epicMapper.mapToDto(entity);
    }

    @Override
    public EpicResponseDto updateEpic(UUID id, EpicRequestDto dto) {
        AccessCriteria writeCriteria = AccessCriteria.builder().allowedRoles(Set.of("Task Manager")).dynamicGroupsField("writeGroups").build();
        Epic entity = dataAccessFilter.findById(Epic.class, id, writeCriteria)
                .orElseThrow(() -> new RuntimeException("Epic not found or access denied"));
        epicMapper.updateEntityFromDto(dto, entity);
        Epic updated = epicRepository.save(entity);
        return epicMapper.mapToDto(updated);
    }

    @Override
    public void deleteEpic(UUID id) {
        AccessCriteria writeCriteria = AccessCriteria.builder().allowedRoles(Set.of("Task Manager")).dynamicGroupsField("writeGroups").build();
        Epic entity = dataAccessFilter.findById(Epic.class, id, writeCriteria)
                .orElseThrow(() -> new RuntimeException("Epic not found or access denied"));
        epicRepository.delete(entity);
    }
}
