package com.ikon.taskmanagement.service.impl;

import com.ikon.taskmanagement.dto.request.TaskWorklogRequestDto;
import com.ikon.taskmanagement.dto.request.WeeklyTimesheetRequestDto;
import com.ikon.taskmanagement.dto.response.TaskWorklogResponseDto;
import com.ikon.taskmanagement.dto.response.WeeklyTimesheetResponseDto;
import com.ikon.taskmanagement.entity.Task;
import com.ikon.taskmanagement.entity.TaskWorklog;
import com.ikon.taskmanagement.mapper.TaskWorklogMapper;
import com.ikon.taskmanagement.repository.TaskRepository;
import com.ikon.taskmanagement.repository.TaskWorklogRepository;
import com.ikon.taskmanagement.service.TaskWorklogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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

        if (dto.getHoursDistribution() != null && !dto.getHoursDistribution().isEmpty()) {
            double totalHours = dto.getHoursDistribution().values().stream().mapToDouble(Double::doubleValue).sum();
            entity.setTotalHours(totalHours);
        } else {
            throw new IllegalArgumentException("Hours distribution cannot be empty");
        }

        TaskWorklog saved = worklogRepository.save(entity);
        updateTaskActualHours(saved.getTaskId());

        return worklogMapper.mapToDto(saved);
    }

    @Override
    public List<WeeklyTimesheetResponseDto> getWeeklyTimesheet(WeeklyTimesheetRequestDto dto) {

        UUID projectId = dto.getProjectId();
        UUID teamMemberIds = dto.getTeamMemberIds();
        LocalDate startDate = dto.getStartDate();
        LocalDate endDate = dto.getEndDate();

        List<Object[]> rows = worklogRepository.getWeeklyTimesheetDataWithFilters(projectId, teamMemberIds, startDate,
                endDate);

        Map<UUID, Map<String, Double>> matrix = new HashMap<>();

        for (Object[] row : rows) {

            UUID userId = (UUID) row[0];
            String date = row[1].toString();
            Double hours = ((Number) row[2]).doubleValue();

            matrix.computeIfAbsent(userId, k -> new HashMap<>()).put(date, hours);
        }

        return matrix.entrySet().stream().map(entry -> {
            WeeklyTimesheetResponseDto responseDto = new WeeklyTimesheetResponseDto();
            responseDto.setTeamMemberId(entry.getKey());
            responseDto.setDailyHours(entry.getValue());
            double total = entry.getValue().values().stream().mapToDouble(Double::doubleValue).sum();
            responseDto.setTotalHours(total);

            return responseDto;
        }).toList();
    }

    @Override
    public List<TaskWorklogResponseDto> getWorklogsByTaskId(UUID taskId) {
        return worklogRepository.findByTaskId(taskId).stream().map(worklogMapper::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public double getHoursByTaskUserAndDate(UUID taskId, UUID userId, LocalDate startDate, LocalDate endDate) {

        Double result = worklogRepository.getTotalHoursBetweenDates(taskId, userId, startDate, endDate);

        return result != null ? result : 0.0;
    }

    @Override
    public List<TaskWorklogResponseDto> getWorklogsByTeamMemberId(UUID teamMemberId) {
        return worklogRepository.findByTeamMemberId(teamMemberId).stream()
                .map(worklogMapper::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public TaskWorklogResponseDto getWorklogById(UUID id) {
        TaskWorklog entity = worklogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Worklog not found"));
        return worklogMapper.mapToDto(entity);
    }

    @Override
    public TaskWorklogResponseDto updateWorklog(UUID id, TaskWorklogRequestDto dto) {
        TaskWorklog entity = worklogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Worklog not found"));
        worklogMapper.updateEntityFromDto(dto, entity);
        TaskWorklog updated = worklogRepository.save(entity);
        updateTaskActualHours(updated.getTaskId());
        return worklogMapper.mapToDto(updated);
    }

    @Override
    public void deleteWorklog(UUID id) {
        TaskWorklog entity = worklogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Worklog not found"));
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
