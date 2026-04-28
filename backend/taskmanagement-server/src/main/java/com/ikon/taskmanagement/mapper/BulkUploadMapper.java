package com.ikon.taskmanagement.mapper;

import com.ikon.taskmanagement.dto.request.BulkTaskUploadRequestDto;
import com.ikon.taskmanagement.dto.request.EpicRequestDto;
import com.ikon.taskmanagement.dto.request.SprintRequestDto;
import com.ikon.taskmanagement.dto.request.TaskRequestDto;
import com.ikon.taskmanagement.entity.Epic;
import com.ikon.taskmanagement.entity.Sprint;
import com.ikon.taskmanagement.entity.Task;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class BulkUploadMapper {

    // Reuse existing mappers — no duplicate logic
    private final EpicMapper   epicMapper;
    private final SprintMapper sprintMapper;
    private final TaskMapper   taskMapper;

    public EpicRequestDto toEpicRequestDto(BulkTaskUploadRequestDto row) {
        EpicRequestDto dto = new EpicRequestDto();
        dto.setProjectId(row.getProjectId());
        dto.setName(row.getEpicName().trim());
        dto.setDescription(row.getEpicDescription());
        dto.setStatus(row.getEpicStatus() != null ? row.getEpicStatus() : "active");
        dto.setStartDate(row.getEpicStartDate()); // epicStartDate → Epic.startDate
        dto.setEndDate(row.getEpicEndDate());     // epicEndDate   → Epic.endDate
        return dto;
    }

    public Epic toEpicEntity(BulkTaskUploadRequestDto row) {
        return epicMapper.mapToEntity(toEpicRequestDto(row));
    }

    public SprintRequestDto toSprintRequestDto(BulkTaskUploadRequestDto row, UUID epicId) {
        SprintRequestDto dto = new SprintRequestDto();
        dto.setProjectId(row.getProjectId());
        dto.setEpicId(epicId);
        dto.setName(row.getSprintName().trim());
        dto.setGoal(row.getSprintGoal());
        dto.setStatus(row.getSprintStatus() != null ? row.getSprintStatus() : "active");
        dto.setStartDate(row.getSprintStartDate()); // sprintStartDate → Sprint.startDate
        dto.setEndDate(row.getSprintEndDate());     // sprintEndDate   → Sprint.endDate
        return dto;
    }

    public Sprint toSprintEntity(BulkTaskUploadRequestDto row, UUID epicId) {
        return sprintMapper.mapToEntity(toSprintRequestDto(row, epicId));
    }


    public TaskRequestDto toTaskRequestDto(BulkTaskUploadRequestDto row, UUID epicId, UUID sprintId) {
        TaskRequestDto dto = new TaskRequestDto();
        dto.setProjectId(row.getProjectId());
        dto.setEpicId(epicId);
        dto.setSprintId(sprintId);
        dto.setTitle(row.getTitle().trim());
        dto.setDescription(row.getDescription());
        dto.setType(row.getType());
        dto.setStatus(row.getStatus() != null ? row.getStatus() : "todo");
        dto.setPriority(row.getPriority());
        dto.setAssigneeId(row.getAssigneeId());
        dto.setReporterId(row.getReporterId());
        dto.setEstimatedHours(row.getEstimatedHours());
        dto.setPlannedDuration(row.getPlannedDuration());
        dto.setStartDate(row.getStartDate()); // task startDate — no prefix
        dto.setEndDate(row.getEndDate());     // task endDate   — no prefix
        return dto;
    }

    public Task toTaskEntity(BulkTaskUploadRequestDto row, UUID epicId, UUID sprintId) {
        return taskMapper.mapToEntity(toTaskRequestDto(row, epicId, sprintId));
    }
}