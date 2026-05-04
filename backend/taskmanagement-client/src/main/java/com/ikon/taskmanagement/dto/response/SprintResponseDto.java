package com.ikon.taskmanagement.dto.response;

import lombok.Data;
import com.ikon.taskmanagement.enums.SprintStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class SprintResponseDto {
    private UUID id;
    private UUID projectId;
    private UUID epicId;
    private String name;
    private String goal;
    private LocalDate startDate;
    private LocalDate endDate;
    private SprintStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
