
package com.ikon.taskmanagement.dto.request;

import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class MyTaskRequestDto {
    private String taskTitle;
    private String taskDescription;
    private String taskType;
    private String taskPriority;
    private String taskStatus;
    private Double estimatedHours;

    private UUID assigneeId;
}
