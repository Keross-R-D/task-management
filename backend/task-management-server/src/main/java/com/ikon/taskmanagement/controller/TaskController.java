package com.ikon.taskmanagement.controller;

import com.ikon.taskmanagement.api.TaskApi;
import com.ikon.taskmanagement.dto.request.TaskRequest;
import com.ikon.taskmanagement.dto.response.TaskResponse;
import com.ikon.taskmanagement.enums.TaskPriority;
import com.ikon.taskmanagement.enums.TaskStatus;
import com.ikon.taskmanagement.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class TaskController implements TaskApi {

    private final TaskService taskService;

    @Override
    public ResponseEntity<TaskResponse> createTask(String accessToken, TaskRequest request) {
        TaskResponse response = taskService.createTask(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @Override
    public ResponseEntity<TaskResponse> getTaskById(String accessToken, Long id) {
        TaskResponse response = taskService.getTaskById(id);
        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<List<TaskResponse>> getAllTasks(String accessToken, TaskStatus status, TaskPriority priority,
            String search) {
        List<TaskResponse> tasks = taskService.getAllTasksWithFilters(status, priority, search);

        return ResponseEntity.ok(tasks);
    }

    @Override
    public ResponseEntity<Page<TaskResponse>> getTasksPaginated(String accessToken, Pageable pageable,
            TaskStatus status, TaskPriority priority,
            String search) {
        Page<TaskResponse> taskPage = taskService.getTasksPaginated(pageable, status, priority, search);
        return ResponseEntity.ok(taskPage);
    }

    @Override
    public ResponseEntity<TaskResponse> updateTask(String accessToken, Long id, TaskRequest request) {
        TaskResponse response = taskService.updateTask(id, request);
        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<Void> deleteTask(String accessToken, Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }
}
