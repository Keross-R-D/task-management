package com.ikon.taskmanagement.mapper;

import com.ikon.taskmanagement.dto.request.MyTaskRequestDto;
import com.ikon.taskmanagement.dto.response.MyTaskResponseDto;
import com.ikon.taskmanagement.entity.MyTask;
import org.springframework.stereotype.Component;

@Component
public class MyTaskMapper {

    public MyTask mapToEntity(MyTaskRequestDto dto) {
        if (dto == null) {
            return null;
        }
        MyTask task = new MyTask();
        updateEntityFromDto(dto, task);
        return task;
    }

    public void updateEntityFromDto(MyTaskRequestDto dto, MyTask task) {
        if (dto == null || task == null) {
            return;
        }

        task.setTaskTitle(dto.getTaskTitle());
        task.setTaskDescription(dto.getTaskDescription());
        task.setTaskType(dto.getTaskType());
        task.setTaskPriority(dto.getTaskPriority());
        task.setTaskStatus(dto.getTaskStatus());
        task.setEstimatedHours(dto.getEstimatedHours());
        task.setAssigneeId(dto.getAssigneeId());
    }

    public MyTaskResponseDto mapToDto(MyTask task) {
        if (task == null) {
            return null;
        }

        MyTaskResponseDto dto = new MyTaskResponseDto();

        dto.setId(task.getId());
        dto.setTaskTitle(task.getTaskTitle());
        dto.setTaskDescription(task.getTaskDescription());
        dto.setTaskType(task.getTaskType());
        dto.setTaskPriority(task.getTaskPriority());
        dto.setTaskStatus(task.getTaskStatus());
        dto.setEstimatedHours(task.getEstimatedHours());
        dto.setActualHours(task.getActualHours());
        dto.setAssigneeId(task.getAssigneeId());
        dto.setCreatedAt(task.getCreatedAt());
        dto.setUpdatedAt(task.getUpdatedAt());

        return dto;
    }
}