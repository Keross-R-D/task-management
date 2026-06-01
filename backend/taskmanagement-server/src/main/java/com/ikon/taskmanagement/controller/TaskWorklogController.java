package com.ikon.taskmanagement.controller;

import com.ikon.taskmanagement.api.TaskWorklogApi;
import com.ikon.taskmanagement.dto.request.TaskWorklogRequestDto;
import com.ikon.taskmanagement.dto.response.TaskWorklogResponseDto;
import com.ikon.taskmanagement.service.TaskWorklogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class TaskWorklogController implements TaskWorklogApi {

    private final TaskWorklogService worklogService;

    @Override
    public ResponseEntity<TaskWorklogResponseDto> createWorklog(@RequestHeader("Authorization") String accessToken, TaskWorklogRequestDto dto) {
        return ResponseEntity.ok(worklogService.createWorklog(dto));
    }

    @Override
    public ResponseEntity<List<TaskWorklogResponseDto>> getWorklogsByTaskId(@RequestHeader("Authorization") String accessToken, UUID taskId) {
        return ResponseEntity.ok(worklogService.getWorklogsByTaskId(taskId));
    }

    @Override
    public ResponseEntity<TaskWorklogResponseDto> getWorklogById(@RequestHeader("Authorization") String accessToken, UUID id) {
        return ResponseEntity.ok(worklogService.getWorklogById(id));
    }

    @Override
    public ResponseEntity<TaskWorklogResponseDto> updateWorklog(@RequestHeader("Authorization") String accessToken, UUID id, TaskWorklogRequestDto dto) {
        return ResponseEntity.ok(worklogService.updateWorklog(id, dto));
    }

    @Override
    public ResponseEntity<Void> deleteWorklog(@RequestHeader("Authorization") String accessToken, UUID id) {
        worklogService.deleteWorklog(id);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<List<TaskWorklogResponseDto>> getWorklogsByProjectId(@RequestHeader("Authorization") String accessToken, UUID projectId) {
        return ResponseEntity.ok(worklogService.getWorklogsByProjectId(projectId));
    }
}
