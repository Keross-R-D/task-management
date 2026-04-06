package com.ikon.taskmanagement.api;

import com.ikon.taskmanagement.dto.request.MyTaskRequestDto;
import com.ikon.taskmanagement.dto.response.MyTaskResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@Tag(name = "My Task APIs", description = "APIs for managing My Tasks")
@RequestMapping("/api/myTasks")
public interface MyTaskApi {
    @Operation(summary = "Create My Task")
    @PostMapping
    ResponseEntity<MyTaskResponseDto> createMyTask(@RequestBody MyTaskRequestDto myTaskDto);


    @Operation(summary = "Fetch all tasks")
    @GetMapping
ResponseEntity<Page<MyTaskResponseDto>> getAllMyTasks(Pageable pageable);

}

    
