package com.ikon.taskmanagement.dto.request;

import lombok.Data;
import com.ikon.taskmanagement.enums.SprintStatus;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class SprintRequestDto {
    private UUID projectId;
    private UUID epicId;
    private String name;
    private String goal;
    private LocalDate startDate;
    private LocalDate endDate;
    private SprintStatus status;
}
