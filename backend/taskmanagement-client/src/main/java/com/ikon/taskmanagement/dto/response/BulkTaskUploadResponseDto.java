package com.ikon.taskmanagement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkTaskUploadResponseDto {

    private int totalRows;
    private int createdCount;
    private int skippedCount;
    private List<RowResultDto> results;
    private List<RowErrorDto> errors;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RowResultDto {
        private int row;
        private String epicName;
        private String sprintName;
        private String taskTitle;
        private String epicAction;
        private String sprintAction;
        private String taskAction;
        private String message;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RowErrorDto {
        private int row;
        private String epicName;
        private String sprintName;
        private String taskTitle;
        private String reason;
    }
}