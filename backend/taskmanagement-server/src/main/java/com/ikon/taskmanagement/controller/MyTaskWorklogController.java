package com.ikon.taskmanagement.controller;

import com.ikon.taskmanagement.api.MyTaskWorklogApi;
import com.ikon.taskmanagement.dto.request.MyTaskWorklogRequestDto;
import com.ikon.taskmanagement.dto.response.MyTaskWorklogResponseDto;
import com.ikon.taskmanagement.service.MyTaskWorklogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class MyTaskWorklogController implements MyTaskWorklogApi {

    private final MyTaskWorklogService worklogService;

    @Override
    public ResponseEntity<MyTaskWorklogResponseDto> createWorklog(@RequestHeader("Authorization") String accessToken, MyTaskWorklogRequestDto dto) {
        return ResponseEntity.ok(worklogService.createWorklog(dto));
    }

    @Override
    public ResponseEntity<List<MyTaskWorklogResponseDto>> getAllWorklogs(@RequestHeader("Authorization") String accessToken) {
        return ResponseEntity.ok(worklogService.getAllWorklogs());
    }

    @Override
    public ResponseEntity<List<MyTaskWorklogResponseDto>> getWorklogsByMyTaskId(@RequestHeader("Authorization") String accessToken, UUID myTaskId) {
        return ResponseEntity.ok(worklogService.getWorklogsByMyTaskId(myTaskId));
    }

    @Override
    public ResponseEntity<MyTaskWorklogResponseDto> getWorklogById(@RequestHeader("Authorization") String accessToken, UUID id) {
        return ResponseEntity.ok(worklogService.getWorklogById(id));
    }

    @Override
    public ResponseEntity<MyTaskWorklogResponseDto> updateWorklog(@RequestHeader("Authorization") String accessToken, UUID id, MyTaskWorklogRequestDto dto) {
        return ResponseEntity.ok(worklogService.updateWorklog(id, dto));
    }

    @Override
    public ResponseEntity<Void> deleteWorklog(@RequestHeader("Authorization") String accessToken, UUID id) {
        worklogService.deleteWorklog(id);
        return ResponseEntity.noContent().build();
    }
}