package com.ikon.taskmanagement.service.impl;

import com.ikon.taskmanagement.dto.request.MyTaskRequestDto;
import com.ikon.taskmanagement.dto.response.MyTaskResponseDto;
import com.ikon.taskmanagement.entity.MyTask;
import com.ikon.taskmanagement.mapper.MyTaskMapper;
import com.ikon.taskmanagement.repository.MyTaskRepository;
import com.ikon.taskmanagement.service.MyTaskService;

import java.util.List;
import java.util.UUID;
import java.util.Collections;

import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import com.ikon.dac.core.AccessCriteria;
import com.ikon.dac.core.DataAccessFilter;

@Service
public class MyTaskServiceImpl implements MyTaskService {
    private final MyTaskRepository myTaskRepository;
    private final MyTaskMapper myTaskMapper;
    private final DataAccessFilter dataAccessFilter;

    public MyTaskServiceImpl(MyTaskRepository myTaskRepository, MyTaskMapper myTaskMapper, DataAccessFilter dataAccessFilter) {
        this.myTaskRepository = myTaskRepository;
        this.myTaskMapper = myTaskMapper;
        this.dataAccessFilter = dataAccessFilter;
    }

    @Override
    public MyTaskResponseDto createMyTask(MyTaskRequestDto myTaskDto) {
        MyTask myTask = myTaskMapper.mapToEntity(myTaskDto);
        MyTask savedMyTask = myTaskRepository.save(myTask);
        return myTaskMapper.mapToDto(savedMyTask);
    }

    @Override
    public Page<MyTaskResponseDto> getAllMyTasks(Pageable pageable) {
        AccessCriteria criteria = AccessCriteria.builder().ownerField("assigneeId").build();
        List<MyTask> tasks = dataAccessFilter.findAll(MyTask.class, criteria);

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), tasks.size());
        
        List<MyTaskResponseDto> pagedList = start >= tasks.size() 
            ? Collections.emptyList()
            : tasks.subList(start, end).stream().map(myTaskMapper::mapToDto).toList();
            
        return new PageImpl<>(pagedList, pageable, tasks.size());
    }

    @Override
    public List<MyTaskResponseDto> getAllMyTasks() {
        AccessCriteria criteria = AccessCriteria.builder().ownerField("assigneeId").build();
        return dataAccessFilter.findAll(MyTask.class, criteria).stream()
                .map(myTaskMapper::mapToDto)
                .toList();
    }

    @Override
    public MyTaskResponseDto updateMyTask(UUID id, MyTaskRequestDto myTaskDto) {
        AccessCriteria criteria = AccessCriteria.builder().ownerField("assigneeId").build();
        MyTask existingMyTask = dataAccessFilter.findById(MyTask.class, id, criteria)
                .orElseThrow(() -> new RuntimeException("My Task not found or access denied"));

        myTaskMapper.updateEntityFromDto(myTaskDto, existingMyTask);
        MyTask updatedMyTask = myTaskRepository.save(existingMyTask);
        return myTaskMapper.mapToDto(updatedMyTask);
    }

    @Override
    public MyTaskResponseDto updateTaskStatus(UUID id, String taskStatus) {
        AccessCriteria criteria = AccessCriteria.builder().ownerField("assigneeId").build();
        MyTask task = dataAccessFilter.findById(MyTask.class, id, criteria)
                .orElseThrow(() -> new RuntimeException("Task not found or access denied"));

        task.setTaskStatus(taskStatus);
        MyTask updatedTask = myTaskRepository.save(task);
        return myTaskMapper.mapToDto(updatedTask);
    }

    @Override
    public void deleteMyTask(UUID id) {
        AccessCriteria criteria = AccessCriteria.builder().ownerField("assigneeId").build();
        MyTask task = dataAccessFilter.findById(MyTask.class, id, criteria)
                .orElseThrow(() -> new RuntimeException("Task not found or access denied"));

        myTaskRepository.delete(task);
    }
}
