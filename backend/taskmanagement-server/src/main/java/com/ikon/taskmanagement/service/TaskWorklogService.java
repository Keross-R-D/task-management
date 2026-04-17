package com.ikon.taskmanagement.service;

import com.ikon.taskmanagement.dto.request.TaskWorklogRequestDto;
import com.ikon.taskmanagement.dto.response.TaskWorklogResponseDto;

import java.util.List;
import java.util.UUID;

public interface TaskWorklogService {
    TaskWorklogResponseDto createWorklog(TaskWorklogRequestDto dto);
    List<TaskWorklogResponseDto> getWorklogsByTaskId(UUID taskId);
    List<TaskWorklogResponseDto> getWorklogsByTeamMemberId(UUID teamMemberId);
    TaskWorklogResponseDto getWorklogById(UUID id);
    TaskWorklogResponseDto updateWorklog(UUID id, TaskWorklogRequestDto dto);
    void deleteWorklog(UUID id);
}
