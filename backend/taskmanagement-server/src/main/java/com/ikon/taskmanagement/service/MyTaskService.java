package com.ikon.taskmanagement.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

import com.ikon.taskmanagement.dto.request.MyTaskRequestDto;
import com.ikon.taskmanagement.dto.response.MyTaskResponseDto;

public interface MyTaskService {

    MyTaskResponseDto createMyTask(MyTaskRequestDto myTaskDto);

    Page<MyTaskResponseDto> getAllMyTasks(Pageable pageable);

    MyTaskResponseDto updateMyTask(UUID id, MyTaskRequestDto myTaskDto);

    MyTaskResponseDto updateTaskStatus(UUID id, String taskStatus);

    void deleteMyTask(UUID id);

}
