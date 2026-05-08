package com.ikon.taskmanagement.dto.response;

import lombok.Data;
import com.ikon.taskmanagement.enums.EpicStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class EpicResponseDto {
    private UUID id;
    private UUID projectId;
    private String name;
    private String description;
    private EpicStatus status;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
