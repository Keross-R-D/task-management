package com.ikon.taskmanagement.dto.response;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class ProjectResponseDto {
    private UUID id;
    private String projectName;
    private String clientName;
    private UUID managerId;
    private LocalDate startDate;
    private LocalDate endDate;
    private String projectStatus;
    private String type;
    private List<UUID> teamMemberIds;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
