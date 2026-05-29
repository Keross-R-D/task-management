package com.ikon.taskmanagement.controller;

import com.ikon.taskmanagement.api.TaskApi;
import com.ikon.taskmanagement.dto.request.TaskRequestDto;
import com.ikon.taskmanagement.dto.request.UpdateTaskStatusDto;
import com.ikon.taskmanagement.dto.response.TaskResponseDto;
import com.ikon.taskmanagement.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class TaskController implements TaskApi {

    private final TaskService taskService;

    @Override
    public ResponseEntity<TaskResponseDto> createTask(@RequestHeader("Authorization") String accessToken, TaskRequestDto dto) {
        return ResponseEntity.ok(taskService.createTask(dto));
    }

    @Override
    public ResponseEntity<List<TaskResponseDto>> getTasksByProjectId(@RequestHeader("Authorization") String accessToken, UUID projectId) {
        return ResponseEntity.ok(taskService.getTasksByProjectId(projectId));
    }

    @Override
    public ResponseEntity<List<TaskResponseDto>> getTasksByEpicId(@RequestHeader("Authorization") String accessToken, UUID epicId) {
        return ResponseEntity.ok(taskService.getTasksByEpicId(epicId));
    }

    @Override
    public ResponseEntity<List<TaskResponseDto>> getTasksBySprintId(@RequestHeader("Authorization") String accessToken, UUID sprintId) {
        return ResponseEntity.ok(taskService.getTasksBySprintId(sprintId));
    }

    @Override
    public ResponseEntity<List<TaskResponseDto>> getProjectBacklog(@RequestHeader("Authorization") String accessToken, UUID projectId) {
        return ResponseEntity.ok(taskService.getProjectBacklog(projectId));
    }

    @Override
    public ResponseEntity<TaskResponseDto> getTaskById(@RequestHeader("Authorization") String accessToken, UUID id) {
        return ResponseEntity.ok(taskService.getTaskById(id));
    }

    @Override
    public ResponseEntity<TaskResponseDto> updateTask(@RequestHeader("Authorization") String accessToken, UUID id, TaskRequestDto dto) {
        return ResponseEntity.ok(taskService.updateTask(id, dto));
    }

    @Override
    public ResponseEntity<Void> deleteTask(@RequestHeader("Authorization") String accessToken, UUID id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<TaskResponseDto> patchTaskStatus(@RequestHeader("Authorization") String accessToken, UUID id, UpdateTaskStatusDto dto) {
        return ResponseEntity.ok(taskService.patchTaskStatus(id, dto));
    }
}
