package com.ikon.taskmanagement.dto.request;

import com.ikon.taskmanagement.enums.SprintStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateSprintStatusDto {

    @NotNull(message = "status is required")
    private SprintStatus status;
}
