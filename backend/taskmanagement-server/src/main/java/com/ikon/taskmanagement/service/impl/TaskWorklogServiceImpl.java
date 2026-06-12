package com.ikon.taskmanagement.service.impl;

import com.ikon.taskmanagement.dto.request.TaskWorklogRequestDto;
import com.ikon.taskmanagement.dto.response.TaskWorklogResponseDto;
import com.ikon.taskmanagement.entity.Task;
import com.ikon.taskmanagement.entity.TaskWorklog;
import com.ikon.taskmanagement.mapper.TaskWorklogMapper;
import com.ikon.taskmanagement.repository.TaskRepository;
import com.ikon.taskmanagement.repository.TaskWorklogRepository;
import com.ikon.taskmanagement.service.TaskWorklogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import com.ikon.dac.core.AccessCriteria;
import com.ikon.dac.core.DataAccessFilter;

@Service
@RequiredArgsConstructor
public class TaskWorklogServiceImpl implements TaskWorklogService {

    private final TaskWorklogRepository worklogRepository;
    private final TaskRepository taskRepository;
    private final TaskWorklogMapper worklogMapper;
    private final DataAccessFilter dataAccessFilter;

    @Override
    public TaskWorklogResponseDto createWorklog(TaskWorklogRequestDto dto) {
        AccessCriteria taskWriteCriteria = AccessCriteria.builder().allowedRoles(Set.of("Task Manager")).ownerField("assigneeId").dynamicGroupsField("writeGroups").build();
        Task task = dataAccessFilter.findById(Task.class, dto.getTaskId(), taskWriteCriteria)
                .orElseThrow(() -> new RuntimeException("Not authorized to create worklog for this task"));

        List<TaskWorklog> existingWorklogs = worklogRepository.findByTaskId(dto.getTaskId());
        TaskWorklog entity;
        if (!existingWorklogs.isEmpty()) {
            entity = existingWorklogs.get(0);
            java.util.Map<String, Double> existingMap = entity.getHoursDistribution();
            if (existingMap == null) {
                existingMap = new java.util.HashMap<>();
            }
            if (dto.getHoursDistribution() != null) {
                for (java.util.Map.Entry<String, Double> entry : dto.getHoursDistribution().entrySet()) {
                    // As i do not want to add the hours to the existing hours distribution
                    // existingMap.merge(entry.getKey(), entry.getValue(), Double::sum);
                    existingMap.put(entry.getKey(), entry.getValue());
                }
            }
            entity.setHoursDistribution(existingMap);
            if (dto.getDescription() != null && !dto.getDescription().isEmpty()) {
                entity.setDescription(dto.getDescription());
            }
        } else {
            entity = worklogMapper.mapToEntity(dto);
        }

        entity.setAssigneeId(task.getAssigneeId());
        entity.setReadGroups(task.getReadGroups() != null ? new HashSet<>(task.getReadGroups()) : new HashSet<>());
        entity.setWriteGroups(task.getWriteGroups() != null ? new HashSet<>(task.getWriteGroups()) : new HashSet<>());

        TaskWorklog saved = worklogRepository.save(entity);
        updateTaskActualHours(saved.getTaskId());
        return worklogMapper.mapToDto(saved);
    }

    @Override
    public List<TaskWorklogResponseDto> getWorklogsByTaskId(UUID taskId) {
        AccessCriteria readCriteria = AccessCriteria.builder().allowedRoles(Set.of("Task Manager")).ownerField("assigneeId").dynamicGroupsField("readGroups").build();
        return dataAccessFilter.findAll(TaskWorklog.class, readCriteria).stream()
                .filter(worklog -> worklog.getTaskId().equals(taskId))
                .map(worklogMapper::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public TaskWorklogResponseDto getWorklogById(UUID id) {
        AccessCriteria readCriteria = AccessCriteria.builder().allowedRoles(Set.of("Task Manager")).ownerField("assigneeId").dynamicGroupsField("readGroups").build();
        TaskWorklog entity = dataAccessFilter.findById(TaskWorklog.class, id, readCriteria)
                .orElseThrow(() -> new RuntimeException("Worklog not found or access denied"));
        return worklogMapper.mapToDto(entity);
    }

    @Override
    public TaskWorklogResponseDto updateWorklog(UUID id, TaskWorklogRequestDto dto) {
        AccessCriteria writeCriteria = AccessCriteria.builder().allowedRoles(Set.of("Task Manager")).ownerField("assigneeId").dynamicGroupsField("writeGroups").build();
        TaskWorklog entity = dataAccessFilter.findById(TaskWorklog.class, id, writeCriteria)
                .orElseThrow(() -> new RuntimeException("Worklog not found or access denied"));
        worklogMapper.updateEntityFromDto(dto, entity);
        TaskWorklog updated = worklogRepository.save(entity);
        updateTaskActualHours(updated.getTaskId());
        return worklogMapper.mapToDto(updated);
    }

    @Override
    public void deleteWorklog(UUID id) {
        AccessCriteria writeCriteria = AccessCriteria.builder().allowedRoles(Set.of("Task Manager")).ownerField("assigneeId").dynamicGroupsField("writeGroups").build();
        TaskWorklog entity = dataAccessFilter.findById(TaskWorklog.class, id, writeCriteria)
                .orElseThrow(() -> new RuntimeException("Worklog not found or access denied"));
        UUID taskId = entity.getTaskId();
        worklogRepository.deleteById(id);
        updateTaskActualHours(taskId);
    }

    private void updateTaskActualHours(UUID taskId) {
        double totalHours = worklogRepository.findByTaskId(taskId).stream()
                .filter(w -> w.getHoursDistribution() != null)
                .flatMapToDouble(w -> w.getHoursDistribution().values().stream().mapToDouble(Double::doubleValue))
                .sum();
        Task task = taskRepository.findById(taskId).orElse(null);
        if (task != null) {
            task.setActualHours(totalHours);
            taskRepository.save(task);
        }
    }

    @Override
    public List<TaskWorklogResponseDto> getWorklogsByProjectId(UUID projectId) {
        AccessCriteria readCriteria = AccessCriteria.builder().allowedRoles(Set.of("Task Manager")).ownerField("assigneeId").dynamicGroupsField("readGroups").build();
        List<UUID> taskIds = taskRepository.findByProjectId(projectId).stream()
                .map(Task::getId)
                .collect(Collectors.toList());
        if (taskIds.isEmpty()) {
            return List.of();
        }
        return dataAccessFilter.findAll(TaskWorklog.class, readCriteria).stream()
                .filter(worklog -> taskIds.contains(worklog.getTaskId()))
                .map(worklogMapper::mapToDto)
                .collect(Collectors.toList());
    }
}
