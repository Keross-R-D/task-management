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
public class SprintServiceImpl implements SprintService {

    private final SprintRepository sprintRepository;
    private final SprintMapper sprintMapper;
    private final DataAccessFilter dataAccessFilter;

    @Override
    public SprintResponseDto createSprint(SprintRequestDto dto) {
        Sprint entity = sprintMapper.mapToEntity(dto);
        AccessCriteria projectCriteria = AccessCriteria.builder().allowedRoles(Set.of("Task Manager")).dynamicGroupsField("writeGroups").build();
        Project project = dataAccessFilter.findById(Project.class, entity.getProjectId(), projectCriteria)
                .orElseThrow(() -> new RuntimeException("Not authorized to create sprint for this project"));

        String teamMemberGroup = "TeamMember_" + project.getId();
        String pmGroup = "ProjectManager_" + project.getId();
        String delegateGroup = "ManagerDelegate_" + project.getId();

        entity.setReadGroups(new HashSet<>(Set.of(teamMemberGroup, pmGroup, delegateGroup)));
        entity.setWriteGroups(new HashSet<>(Set.of(pmGroup, delegateGroup)));

        Sprint saved = sprintRepository.save(entity);
        return sprintMapper.mapToDto(saved);
    }

    @Override
    public List<SprintResponseDto> getSprintsByEpicId(UUID epicId) {
        AccessCriteria readCriteria = AccessCriteria.builder().allowedRoles(Set.of("Task Manager")).dynamicGroupsField("readGroups").build();
        return dataAccessFilter.findAll(Sprint.class, readCriteria).stream()
                .filter(sprint -> sprint.getEpicId().equals(epicId))
                .map(sprintMapper::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<SprintResponseDto> getSprintsByProjectId(UUID projectId) {
        AccessCriteria readCriteria = AccessCriteria.builder().allowedRoles(Set.of("Task Manager")).dynamicGroupsField("readGroups").build();
        return dataAccessFilter.findAll(Sprint.class, readCriteria).stream()
                .filter(sprint -> sprint.getProjectId().equals(projectId))
                .map(sprintMapper::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public SprintResponseDto getSprintById(UUID id) {
        AccessCriteria readCriteria = AccessCriteria.builder().allowedRoles(Set.of("Task Manager")).dynamicGroupsField("readGroups").build();
        Sprint entity = dataAccessFilter.findById(Sprint.class, id, readCriteria)
                .orElseThrow(() -> new RuntimeException("Sprint not found or access denied"));
        return sprintMapper.mapToDto(entity);
    }

    @Override
    public SprintResponseDto updateSprint(UUID id, SprintRequestDto dto) {
        AccessCriteria writeCriteria = AccessCriteria.builder().allowedRoles(Set.of("Task Manager")).dynamicGroupsField("writeGroups").build();
        Sprint entity = dataAccessFilter.findById(Sprint.class, id, writeCriteria)
                .orElseThrow(() -> new RuntimeException("Sprint not found or access denied"));
        sprintMapper.updateEntityFromDto(dto, entity);
        Sprint updated = sprintRepository.save(entity);
        return sprintMapper.mapToDto(updated);
    }

    @Override
    public SprintResponseDto patchSprintStatus(UUID id, UpdateSprintStatusDto dto) {
        AccessCriteria writeCriteria = AccessCriteria.builder().allowedRoles(Set.of("Task Manager")).dynamicGroupsField("writeGroups").build();
        Sprint entity = dataAccessFilter.findById(Sprint.class, id, writeCriteria)
                .orElseThrow(() -> new RuntimeException("Sprint not found or access denied"));
        entity.setStatus(dto.getStatus());
        Sprint updated = sprintRepository.save(entity);
        return sprintMapper.mapToDto(updated);
    }

    @Override
    public void deleteSprint(UUID id) {
        AccessCriteria writeCriteria = AccessCriteria.builder().allowedRoles(Set.of("Task Manager")).dynamicGroupsField("writeGroups").build();
        Sprint entity = dataAccessFilter.findById(Sprint.class, id, writeCriteria)
                .orElseThrow(() -> new RuntimeException("Sprint not found or access denied"));
        sprintRepository.delete(entity);
    }
}
