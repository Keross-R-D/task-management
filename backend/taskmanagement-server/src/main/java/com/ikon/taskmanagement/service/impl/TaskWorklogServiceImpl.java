package com.ikon.taskmanagement.service.impl;

import com.ikon.taskmanagement.dto.request.TaskWorklogRequestDto;
import com.ikon.taskmanagement.dto.response.TaskWorklogResponseDto;
import com.ikon.taskmanagement.entity.Task;
import com.ikon.taskmanagement.entity.TaskWorklog;
import com.ikon.taskmanagement.mapper.TaskWorklogMapper;
import com.ikon.taskmanagement.repository.TaskRepository;
import com.ikon.taskmanagement.repository.TaskWorklogRepository;
import com.ikon.taskmanagement.service.TaskWorklogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskWorklogServiceImpl implements TaskWorklogService {

    private final TaskWorklogRepository worklogRepository;
    private final TaskRepository taskRepository;
    private final TaskWorklogMapper worklogMapper;

    @Override
    public TaskWorklogResponseDto createWorklog(TaskWorklogRequestDto dto) {
        TaskWorklog entity = worklogMapper.mapToEntity(dto);
        TaskWorklog saved = worklogRepository.save(entity);
        updateTaskActualHours(saved.getTaskId());
        return worklogMapper.mapToDto(saved);
    }

    @Override
    public List<TaskWorklogResponseDto> getWorklogsByTaskId(UUID taskId) {
        return worklogRepository.findByTaskId(taskId).stream()
                .map(worklogMapper::mapToDto)
                .collect(Collectors.toList());
    }


    @Override
    public TaskWorklogResponseDto getWorklogById(UUID id) {
        TaskWorklog entity = worklogRepository.findById(id).orElseThrow(() -> new RuntimeException("Worklog not found"));
        return worklogMapper.mapToDto(entity);
    }

    @Override
    public TaskWorklogResponseDto updateWorklog(UUID id, TaskWorklogRequestDto dto) {
        TaskWorklog entity = worklogRepository.findById(id).orElseThrow(() -> new RuntimeException("Worklog not found"));
        worklogMapper.updateEntityFromDto(dto, entity);
        TaskWorklog updated = worklogRepository.save(entity);
        updateTaskActualHours(updated.getTaskId());
        return worklogMapper.mapToDto(updated);
    }

    @Override
    public void deleteWorklog(UUID id) {
        TaskWorklog entity = worklogRepository.findById(id).orElseThrow(() -> new RuntimeException("Worklog not found"));
        UUID taskId = entity.getTaskId();
        worklogRepository.deleteById(id);
        updateTaskActualHours(taskId);
    }
    
    private void updateTaskActualHours(UUID taskId) {
        double totalHours = worklogRepository.findByTaskId(taskId).stream()
                .filter(w -> w.getHoursDistribution() != null)
                .flatMapToDouble(w -> w.getHoursDistribution().values().stream().mapToDouble(Double::doubleValue))
                .sum();
        Task task = taskRepository.findById(taskId).orElse(null);
        if (task != null) {
            task.setActualHours(totalHours);
            taskRepository.save(task);
        }
    }
}
