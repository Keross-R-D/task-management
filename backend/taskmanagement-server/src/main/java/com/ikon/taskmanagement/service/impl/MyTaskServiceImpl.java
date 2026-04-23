package com.ikon.taskmanagement.service.impl;

import com.ikon.taskmanagement.dto.request.MyTaskRequestDto;
import com.ikon.taskmanagement.dto.response.MyTaskResponseDto;
import com.ikon.taskmanagement.entity.MyTask;
import com.ikon.taskmanagement.mapper.MyTaskMapper;
import com.ikon.taskmanagement.repository.MyTaskRepository;
import com.ikon.taskmanagement.service.MyTaskService;

import java.util.UUID;

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

    @Override
    public MyTaskResponseDto updateMyTask(UUID id, MyTaskRequestDto myTaskDto) {

        MyTask existingMyTask = myTaskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("My Task not found with id: " + id));

        myTaskMapper.updateEntityFromDto(myTaskDto, existingMyTask);

        MyTask updatedMyTask = myTaskRepository.save(existingMyTask);

        return myTaskMapper.mapToDto(updatedMyTask);
    }

    @Override
    public MyTaskResponseDto updateTaskStatus(UUID id, String taskStatus) {

        MyTask task = myTaskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));

        task.setTaskStatus(taskStatus);

        MyTask updatedTask = myTaskRepository.save(task);

        return myTaskMapper.mapToDto(updatedTask);
    }

    @Override
    public void deleteMyTask(UUID id) {
        MyTask task = myTaskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));

        myTaskRepository.delete(task);

    }
}
