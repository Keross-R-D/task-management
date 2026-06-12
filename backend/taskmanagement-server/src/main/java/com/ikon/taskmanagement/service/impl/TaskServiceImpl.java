package com.ikon.taskmanagement.service.impl;

import com.ikon.taskmanagement.dto.request.TaskRequestDto;
import com.ikon.taskmanagement.dto.request.UpdateTaskStatusDto;
import com.ikon.taskmanagement.dto.response.TaskResponseDto;
import com.ikon.taskmanagement.entity.Task;
import com.ikon.taskmanagement.mapper.TaskMapper;
import com.ikon.taskmanagement.repository.TaskRepository;
import com.ikon.taskmanagement.service.TaskService;
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
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final TaskMapper taskMapper;
    private final DataAccessFilter dataAccessFilter;

    @Override
    public TaskResponseDto createTask(TaskRequestDto dto) {
        Task entity = taskMapper.mapToEntity(dto);
        AccessCriteria projectCriteria = AccessCriteria.builder().allowedRoles(Set.of("Task Manager")).dynamicGroupsField("writeGroups").build();
        Project project = dataAccessFilter.findById(Project.class, entity.getProjectId(), projectCriteria)
                .orElseThrow(() -> new RuntimeException("Not authorized to create task for this project"));

        String teamMemberGroup = "TeamMember_" + project.getId();
        String pmGroup = "ProjectManager_" + project.getId();
        String delegateGroup = "ManagerDelegate_" + project.getId();

        entity.setReadGroups(new HashSet<>(Set.of(teamMemberGroup, pmGroup, delegateGroup)));
        entity.setWriteGroups(new HashSet<>(Set.of(pmGroup, delegateGroup)));

        Task saved = taskRepository.save(entity);
        return taskMapper.mapToDto(saved);
    }

    @Override
    public List<TaskResponseDto> getTasksByProjectId(UUID projectId) {
        AccessCriteria readCriteria = AccessCriteria.builder().allowedRoles(Set.of("Task Manager")).ownerField("assigneeId").dynamicGroupsField("readGroups").build();
        return dataAccessFilter.findAll(Task.class, readCriteria).stream()
                .filter(task -> task.getProjectId().equals(projectId))
                .map(taskMapper::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<TaskResponseDto> getTasksByEpicId(UUID epicId) {
        AccessCriteria readCriteria = AccessCriteria.builder().allowedRoles(Set.of("Task Manager")).ownerField("assigneeId").dynamicGroupsField("readGroups").build();
        return dataAccessFilter.findAll(Task.class, readCriteria).stream()
                .filter(task -> task.getEpicId() != null && task.getEpicId().equals(epicId))
                .map(taskMapper::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<TaskResponseDto> getTasksBySprintId(UUID sprintId) {
        AccessCriteria readCriteria = AccessCriteria.builder().allowedRoles(Set.of("Task Manager")).ownerField("assigneeId").dynamicGroupsField("readGroups").build();
        return dataAccessFilter.findAll(Task.class, readCriteria).stream()
                .filter(task -> task.getSprintId() != null && task.getSprintId().equals(sprintId))
                .map(taskMapper::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<TaskResponseDto> getProjectBacklog(UUID projectId) {
        AccessCriteria readCriteria = AccessCriteria.builder().allowedRoles(Set.of("Task Manager")).ownerField("assigneeId").dynamicGroupsField("readGroups").build();
        return dataAccessFilter.findAll(Task.class, readCriteria).stream()
                .filter(task -> task.getProjectId().equals(projectId) && task.getSprintId() == null)
                .map(taskMapper::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public TaskResponseDto getTaskById(UUID id) {
        AccessCriteria readCriteria = AccessCriteria.builder().allowedRoles(Set.of("Task Manager")).ownerField("assigneeId").dynamicGroupsField("readGroups").build();
        Task entity = dataAccessFilter.findById(Task.class, id, readCriteria)
                .orElseThrow(() -> new RuntimeException("Task not found or access denied"));
        return taskMapper.mapToDto(entity);
    }

    @Override
    public TaskResponseDto updateTask(UUID id, TaskRequestDto dto) {
        AccessCriteria writeCriteria = AccessCriteria.builder().allowedRoles(Set.of("Task Manager")).ownerField("assigneeId").dynamicGroupsField("writeGroups").build();
        Task entity = dataAccessFilter.findById(Task.class, id, writeCriteria)
                .orElseThrow(() -> new RuntimeException("Task not found or access denied"));
        taskMapper.updateEntityFromDto(dto, entity);
        Task updated = taskRepository.save(entity);
        return taskMapper.mapToDto(updated);
    }

    @Override
    public TaskResponseDto patchTaskStatus(UUID id, UpdateTaskStatusDto dto) {
        AccessCriteria writeCriteria = AccessCriteria.builder().allowedRoles(Set.of("Task Manager")).ownerField("assigneeId").dynamicGroupsField("writeGroups").build();
        Task entity = dataAccessFilter.findById(Task.class, id, writeCriteria)
                .orElseThrow(() -> new RuntimeException("Task not found or access denied"));
        entity.setStatus(dto.getTaskStatus());
        Task updated = taskRepository.save(entity);
        return taskMapper.mapToDto(updated);
    }

    @Override
    public void deleteTask(UUID id) {
        AccessCriteria writeCriteria = AccessCriteria.builder().allowedRoles(Set.of("Task Manager")).ownerField("assigneeId").dynamicGroupsField("writeGroups").build();
        Task entity = dataAccessFilter.findById(Task.class, id, writeCriteria)
                .orElseThrow(() -> new RuntimeException("Task not found or access denied"));
        taskRepository.delete(entity);
    }
}
