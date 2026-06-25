package com.ikon.taskmanagement.controller;

import com.ikon.taskmanagement.api.MyTaskApi;
import com.ikon.taskmanagement.dto.request.MyTaskRequestDto;
import com.ikon.taskmanagement.dto.request.UpdateTaskStatusDto;
import com.ikon.taskmanagement.dto.response.MyTaskResponseDto;
import com.ikon.taskmanagement.service.MyTaskService;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@RestController
public class MyTaskController implements MyTaskApi {

    private final MyTaskService myTaskService;

    public MyTaskController(MyTaskService myTaskService) {
        this.myTaskService = myTaskService;
    }

    @Override
    public ResponseEntity<MyTaskResponseDto> createMyTask(@RequestHeader("Authorization") String accessToken,
            MyTaskRequestDto myTaskDto) {
        return new ResponseEntity<>(myTaskService.createMyTask(myTaskDto), HttpStatus.CREATED);
    }

    @Override
    public ResponseEntity<Page<MyTaskResponseDto>> getAllMyTasks(@RequestHeader("Authorization") String accessToken,
            Pageable pageable) {
        return ResponseEntity.ok(myTaskService.getAllMyTasks(pageable));
    }

    @Override
    public ResponseEntity<List<MyTaskResponseDto>> getAllMyTasksList(
            @RequestHeader("Authorization") String accessToken) {
        return ResponseEntity.ok(myTaskService.getAllMyTasks());
    }

    @Override
    public ResponseEntity<MyTaskResponseDto> updateMyTask(@RequestHeader("Authorization") String accessToken, UUID id,
            MyTaskRequestDto myTaskDto) {
        return ResponseEntity.ok(myTaskService.updateMyTask(id, myTaskDto));
    }

    @Override
    public ResponseEntity<MyTaskResponseDto> updateTaskStatus(@RequestHeader("Authorization") String accessToken,
            UUID id,
            UpdateTaskStatusDto dto) {

        return ResponseEntity.ok(
                myTaskService.updateTaskStatus(id, dto.getTaskStatus().name()));
    }

    @Override
    public ResponseEntity<Void> deleteMyTask(@RequestHeader("Authorization") String accessToken, UUID id) {
        myTaskService.deleteMyTask(id);
        return ResponseEntity.noContent().build();
    }

}
