package com.ikon.taskmanagement.service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

import com.ikon.taskmanagement.dto.request.MyTaskRequestDto;
import com.ikon.taskmanagement.dto.response.MyTaskResponseDto;

public interface MyTaskService {
    
    MyTaskResponseDto createMyTask(MyTaskRequestDto myTaskDto);
    Page<MyTaskResponseDto> getAllMyTasks(Pageable pageable);
   
}
