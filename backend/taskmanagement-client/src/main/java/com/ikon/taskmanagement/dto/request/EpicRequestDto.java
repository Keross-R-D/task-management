package com.ikon.taskmanagement.dto.request;

import lombok.Data;
import com.ikon.taskmanagement.enums.EpicStatus;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class EpicRequestDto {
    private UUID projectId;
    private String name;
    private Long epicNumber;
    private String description;
    private EpicStatus status;
    private LocalDate startDate;
    private LocalDate endDate;
}
