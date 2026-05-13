package com.ikon.taskmanagement.service.impl;

import com.ikon.taskmanagement.dto.request.MyTaskWorklogRequestDto;
import com.ikon.taskmanagement.dto.response.MyTaskWorklogResponseDto;
import com.ikon.taskmanagement.entity.MyTask;
import com.ikon.taskmanagement.entity.MyTaskWorklog;
import com.ikon.taskmanagement.mapper.MyTaskWorklogMapper;
import com.ikon.taskmanagement.repository.MyTaskRepository;
import com.ikon.taskmanagement.repository.MyTaskWorklogRepository;
import com.ikon.taskmanagement.service.MyTaskWorklogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MyTaskWorklogServiceImpl implements MyTaskWorklogService {

    private final MyTaskWorklogRepository worklogRepository;
    private final MyTaskRepository myTaskRepository;
    private final MyTaskWorklogMapper worklogMapper;

    @Override
    public MyTaskWorklogResponseDto createWorklog(MyTaskWorklogRequestDto dto) {

        List<MyTaskWorklog> existingWorklogs = worklogRepository.findByMyTaskId(dto.getMyTaskId());

        MyTaskWorklog entity;

        if (!existingWorklogs.isEmpty()) {
            entity = existingWorklogs.get(0);

            java.util.Map<String, Double> existingMap = entity.getHoursDistribution();
            if (existingMap == null) {
                existingMap = new java.util.HashMap<>();
            }

            if (dto.getHoursDistribution() != null) {
                for (java.util.Map.Entry<String, Double> entry : dto.getHoursDistribution().entrySet()) {
                    // overwrite same date instead of summing
                    existingMap.put(entry.getKey(), entry.getValue());
                }
            }

            entity.setHoursDistribution(existingMap);

            if (dto.getDescription() != null && !dto.getDescription().isEmpty()) {
                entity.setDescription(dto.getDescription());
            }

        } else {
            entity = worklogMapper.mapToEntity(dto);
        }

        MyTaskWorklog saved = worklogRepository.save(entity);

        updateMyTaskActualHours(saved.getMyTaskId());

        return worklogMapper.mapToDto(saved);
    }

    @Override
    public List<MyTaskWorklogResponseDto> getAllWorklogs() {
        return worklogRepository.findAll().stream()
                .map(worklogMapper::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<MyTaskWorklogResponseDto> getWorklogsByMyTaskId(UUID myTaskId) {
        return worklogRepository.findByMyTaskId(myTaskId).stream()
                .map(worklogMapper::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public MyTaskWorklogResponseDto getWorklogById(UUID id) {
        MyTaskWorklog entity = worklogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Worklog not found"));
        return worklogMapper.mapToDto(entity);
    }

    @Override
    public MyTaskWorklogResponseDto updateWorklog(UUID id, MyTaskWorklogRequestDto dto) {
        MyTaskWorklog entity = worklogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Worklog not found"));

        worklogMapper.updateEntityFromDto(dto, entity);

        MyTaskWorklog updated = worklogRepository.save(entity);

        updateMyTaskActualHours(updated.getMyTaskId());

        return worklogMapper.mapToDto(updated);
    }

    @Override
    public void deleteWorklog(UUID id) {
        MyTaskWorklog entity = worklogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Worklog not found"));

        UUID myTaskId = entity.getMyTaskId();

        worklogRepository.deleteById(id);

        updateMyTaskActualHours(myTaskId);
    }

    private void updateMyTaskActualHours(UUID myTaskId) {

        double totalHours = worklogRepository.findByMyTaskId(myTaskId).stream()
                .filter(w -> w.getHoursDistribution() != null)
                .flatMapToDouble(w -> w.getHoursDistribution().values().stream()
                        .mapToDouble(Double::doubleValue))
                .sum();

        MyTask task = myTaskRepository.findById(myTaskId).orElse(null);

        if (task != null) {
            task.setActualHours(totalHours);
            myTaskRepository.save(task);
        }
    }
}