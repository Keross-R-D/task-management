package com.ikon.projectmanagement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class WorkingDayDto {
    private UUID id;
    private UUID accountId;
    private String year;
    private String month;
    private String workingDays;
}
