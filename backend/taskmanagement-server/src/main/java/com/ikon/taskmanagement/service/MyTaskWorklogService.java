package com.ikon.taskmanagement.service;

import com.ikon.taskmanagement.dto.request.MyTaskWorklogRequestDto;
import com.ikon.taskmanagement.dto.response.MyTaskWorklogResponseDto;

import java.util.List;
import java.util.UUID;

public interface MyTaskWorklogService {

    MyTaskWorklogResponseDto createWorklog(MyTaskWorklogRequestDto dto);

    List<MyTaskWorklogResponseDto> getWorklogsByMyTaskId(UUID myTaskId);

    MyTaskWorklogResponseDto getWorklogById(UUID id);

    MyTaskWorklogResponseDto updateWorklog(UUID id, MyTaskWorklogRequestDto dto);

    void deleteWorklog(UUID id);
}