package com.ikon.taskmanagement.service.impl;

import com.ikon.taskmanagement.dto.request.MyTaskRequestDto;
import com.ikon.taskmanagement.dto.response.MyTaskResponseDto;
import com.ikon.taskmanagement.dto.response.ProjectResponseDto;
import com.ikon.taskmanagement.entity.MyTask;
import com.ikon.taskmanagement.mapper.MyTaskMapper;
import com.ikon.taskmanagement.repository.MyTaskRepository;
import com.ikon.taskmanagement.service.MyTaskService;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;


@Service
public class MyTaskServiceImpl implements MyTaskService {
    private final MyTaskRepository myTaskRepository;
    private final MyTaskMapper myTaskMapper;

    public MyTaskServiceImpl(MyTaskRepository myTaskRepository, MyTaskMapper myTaskMapper) {
        this.myTaskRepository = myTaskRepository;
        this.myTaskMapper = myTaskMapper;
    }

    @Override
    public MyTaskResponseDto createMyTask(MyTaskRequestDto myTaskDto) {
        MyTask myTask = myTaskMapper.mapToEntity(myTaskDto);
        MyTask savedMyTask = myTaskRepository.save(myTask);
        return myTaskMapper.mapToDto(savedMyTask);
    }   

    @Override
    public Page<MyTaskResponseDto> getAllMyTasks(Pageable pageable) {
        return myTaskRepository.findAll(pageable)
            .map(task -> myTaskMapper.mapToDto(task));
    }
}
