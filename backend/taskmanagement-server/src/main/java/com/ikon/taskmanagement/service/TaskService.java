package com.ikon.taskmanagement.service;

import com.ikon.taskmanagement.dto.request.TaskRequestDto;
import com.ikon.taskmanagement.dto.response.TaskResponseDto;

import java.util.List;
import java.util.UUID;

public interface TaskService {
    TaskResponseDto createTask(TaskRequestDto dto);
    List<TaskResponseDto> getTasksByProjectId(UUID projectId);
    List<TaskResponseDto> getTasksByEpicId(UUID epicId);
    List<TaskResponseDto> getTasksBySprintId(UUID sprintId);
    List<TaskResponseDto> getProjectBacklog(UUID projectId);
    TaskResponseDto getTaskById(UUID id);
    TaskResponseDto updateTask(UUID id, TaskRequestDto dto);
    void deleteTask(UUID id);
}
