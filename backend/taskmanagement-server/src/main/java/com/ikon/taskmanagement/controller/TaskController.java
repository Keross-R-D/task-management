package com.ikon.taskmanagement.controller;

import com.ikon.taskmanagement.api.TaskApi;
import com.ikon.taskmanagement.dto.request.TaskRequestDto;
import com.ikon.taskmanagement.dto.response.TaskResponseDto;
import com.ikon.taskmanagement.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class TaskController implements TaskApi {

    private final TaskService taskService;

    @Override
    public ResponseEntity<TaskResponseDto> createTask(TaskRequestDto dto) {
         System.out.println(dto);
        return ResponseEntity.ok(taskService.createTask(dto));
    }

    @Override
    public ResponseEntity<List<TaskResponseDto>> getTasksByProjectId(UUID projectId) {
        return ResponseEntity.ok(taskService.getTasksByProjectId(projectId));
    }

    @Override
    public ResponseEntity<List<TaskResponseDto>> getTasksByEpicId(UUID epicId) {
        return ResponseEntity.ok(taskService.getTasksByEpicId(epicId));
    }

    @Override
    public ResponseEntity<List<TaskResponseDto>> getTasksBySprintId(UUID sprintId) {
        return ResponseEntity.ok(taskService.getTasksBySprintId(sprintId));
    }

    @Override
    public ResponseEntity<List<TaskResponseDto>> getProjectBacklog(UUID projectId) {
        return ResponseEntity.ok(taskService.getProjectBacklog(projectId));
    }

    @Override
    public ResponseEntity<TaskResponseDto> getTaskById(UUID id) {
        return ResponseEntity.ok(taskService.getTaskById(id));
    }

    @Override
    public ResponseEntity<TaskResponseDto> updateTask(UUID id, TaskRequestDto dto) {
        return ResponseEntity.ok(taskService.updateTask(id, dto));
    }

    @Override
    public ResponseEntity<Void> deleteTask(UUID id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }
}
