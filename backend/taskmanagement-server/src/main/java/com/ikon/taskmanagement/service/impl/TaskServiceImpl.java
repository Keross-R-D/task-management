package com.ikon.taskmanagement.service.impl;

import com.ikon.taskmanagement.dto.request.TaskRequestDto;
import com.ikon.taskmanagement.dto.response.TaskResponseDto;
import com.ikon.taskmanagement.entity.Task;
import com.ikon.taskmanagement.mapper.TaskMapper;
import com.ikon.taskmanagement.repository.TaskRepository;
import com.ikon.taskmanagement.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final TaskMapper taskMapper;

    @Override
    public TaskResponseDto createTask(TaskRequestDto dto) {
        Task entity = taskMapper.mapToEntity(dto);
        Task saved = taskRepository.save(entity);
        return taskMapper.mapToDto(saved);
    }

    @Override
    public List<TaskResponseDto> getTasksByProjectId(UUID projectId) {
        return taskRepository.findByProjectId(projectId).stream()
                .map(taskMapper::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<TaskResponseDto> getTasksByEpicId(UUID epicId) {
        return taskRepository.findByEpicId(epicId).stream()
                .map(taskMapper::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<TaskResponseDto> getTasksBySprintId(UUID sprintId) {
        return taskRepository.findBySprintId(sprintId).stream()
                .map(taskMapper::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<TaskResponseDto> getProjectBacklog(UUID projectId) {
        return taskRepository.findByProjectIdAndSprintIdIsNull(projectId).stream()
                .map(taskMapper::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public TaskResponseDto getTaskById(UUID id) {
        Task entity = taskRepository.findById(id).orElseThrow(() -> new RuntimeException("Task not found"));
        return taskMapper.mapToDto(entity);
    }

    @Override
    public TaskResponseDto updateTask(UUID id, TaskRequestDto dto) {
        Task entity = taskRepository.findById(id).orElseThrow(() -> new RuntimeException("Task not found"));
        taskMapper.updateEntityFromDto(dto, entity);
        Task updated = taskRepository.save(entity);
        return taskMapper.mapToDto(updated);
    }

    @Override
    public void deleteTask(UUID id) {
        taskRepository.deleteById(id);
    }
}
