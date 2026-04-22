package com.ikon.taskmanagement.dto.request;

import lombok.Data;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class EpicRequestDto {
    private UUID projectId;
    private String name;
    private String description;
    private String status;
    private LocalDate startDate;
    private LocalDate endDate;
}
