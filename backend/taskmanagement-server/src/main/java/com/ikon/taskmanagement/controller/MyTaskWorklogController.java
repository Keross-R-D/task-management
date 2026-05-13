package com.ikon.taskmanagement.controller;

import com.ikon.taskmanagement.api.MyTaskWorklogApi;
import com.ikon.taskmanagement.dto.request.MyTaskWorklogRequestDto;
import com.ikon.taskmanagement.dto.response.MyTaskWorklogResponseDto;
import com.ikon.taskmanagement.service.MyTaskWorklogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class MyTaskWorklogController implements MyTaskWorklogApi {

    private final MyTaskWorklogService worklogService;

    @Override
    public ResponseEntity<MyTaskWorklogResponseDto> createWorklog(MyTaskWorklogRequestDto dto) {
        return ResponseEntity.ok(worklogService.createWorklog(dto));
    }

    @Override
    public ResponseEntity<List<MyTaskWorklogResponseDto>> getAllWorklogs() {
        return ResponseEntity.ok(worklogService.getAllWorklogs());
    }

    @Override
    public ResponseEntity<List<MyTaskWorklogResponseDto>> getWorklogsByMyTaskId(UUID myTaskId) {
        return ResponseEntity.ok(worklogService.getWorklogsByMyTaskId(myTaskId));
    }

    @Override
    public ResponseEntity<MyTaskWorklogResponseDto> getWorklogById(UUID id) {
        return ResponseEntity.ok(worklogService.getWorklogById(id));
    }

    @Override
    public ResponseEntity<MyTaskWorklogResponseDto> updateWorklog(UUID id, MyTaskWorklogRequestDto dto) {
        return ResponseEntity.ok(worklogService.updateWorklog(id, dto));
    }

    @Override
    public ResponseEntity<Void> deleteWorklog(UUID id) {
        worklogService.deleteWorklog(id);
        return ResponseEntity.noContent().build();
    }
}