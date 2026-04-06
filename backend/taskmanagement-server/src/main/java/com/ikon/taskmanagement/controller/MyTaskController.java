package com.ikon.taskmanagement.controller;

import com.ikon.taskmanagement.api.MyTaskApi;
import com.ikon.taskmanagement.dto.request.MyTaskRequestDto;
import com.ikon.taskmanagement.dto.response.MyTaskResponseDto;
import com.ikon.taskmanagement.dto.response.ProjectResponseDto;
import com.ikon.taskmanagement.service.MyTaskService;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@RestController
@CrossOrigin(origins = "*")
public class MyTaskController implements MyTaskApi {

     private final MyTaskService myTaskService;

    public MyTaskController(MyTaskService myTaskService) {
        this.myTaskService = myTaskService;
    }

    @Override
    public ResponseEntity<MyTaskResponseDto> createMyTask(MyTaskRequestDto myTaskDto) {
        return new ResponseEntity<>(myTaskService.createMyTask(myTaskDto), HttpStatus.CREATED);
    }

   @Override
public ResponseEntity<Page<MyTaskResponseDto>> getAllMyTasks(Pageable pageable) {
    return ResponseEntity.ok(myTaskService.getAllMyTasks(pageable));
}
    
    
}
