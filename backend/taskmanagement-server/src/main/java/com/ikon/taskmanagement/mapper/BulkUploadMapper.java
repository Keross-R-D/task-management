package com.ikon.taskmanagement.mapper;

import com.ikon.taskmanagement.dto.request.BulkTaskUploadRequestDto;
import com.ikon.taskmanagement.dto.request.SprintRequestDto;
import com.ikon.taskmanagement.dto.request.TaskRequestDto;
import com.ikon.taskmanagement.entity.Sprint;
import com.ikon.taskmanagement.entity.Task;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import com.ikon.taskmanagement.enums.SprintStatus;
import com.ikon.taskmanagement.enums.TaskStatus;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class BulkUploadMapper {

    private final SprintMapper sprintMapper;
    private final TaskMapper taskMapper;

    public SprintRequestDto toSprintRequestDto(BulkTaskUploadRequestDto row, UUID epicId) {
        SprintRequestDto dto = new SprintRequestDto();
        dto.setProjectId(row.getProjectId());
        dto.setEpicId(epicId);
        dto.setName(row.getSprintName().trim());
        dto.setGoal(row.getSprintGoal());
        dto.setStatus(
                row.getSprintStatus() != null
                        ? SprintStatus.valueOf(row.getSprintStatus().toUpperCase())
                        : SprintStatus.PLANNED);
        dto.setStartDate(row.getSprintStartDate()); // sprintStartDate → Sprint.startDate
        dto.setEndDate(row.getSprintEndDate()); // sprintEndDate → Sprint.endDate
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
        dto.setStatus(
                row.getStatus() != null
                        ? TaskStatus.valueOf(row.getStatus().toUpperCase())
                        : TaskStatus.TO_DO);
        dto.setPriority(row.getPriority());
        dto.setAssigneeId(row.getAssigneeId());
        dto.setReporterId(row.getReporterId());
        dto.setEstimatedHours(row.getEstimatedHours());
        dto.setPlannedDuration(row.getPlannedDuration());
        dto.setStartDate(row.getStartDate()); // task startDate — no prefix
        dto.setEndDate(row.getEndDate()); // task endDate — no prefix
        return dto;
    }

    public Task toTaskEntity(BulkTaskUploadRequestDto row, UUID epicId, UUID sprintId) {
        return taskMapper.mapToEntity(toTaskRequestDto(row, epicId, sprintId));
    }
}