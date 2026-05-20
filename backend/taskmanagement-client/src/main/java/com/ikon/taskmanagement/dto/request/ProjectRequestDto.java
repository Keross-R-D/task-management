package com.ikon.taskmanagement.dto.request;

import lombok.Data;

import com.ikon.taskmanagement.enums.ProjectStatus;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
public class ProjectRequestDto {
    private String projectName;
    private String clientName;
    private UUID managerId;
    private UUID managerDelegateId;
    private LocalDate startDate;
    private LocalDate endDate;
    private ProjectStatus projectStatus;
    private String type;
    private List<UUID> teamMemberIds;
}
