package com.ikon.taskmanagement.service.impl;

import com.ikon.taskmanagement.dto.request.BulkTaskUploadRequestDto;
import com.ikon.taskmanagement.dto.response.BulkTaskUploadResponseDto;
import com.ikon.taskmanagement.dto.response.BulkTaskUploadResponseDto.RowErrorDto;
import com.ikon.taskmanagement.dto.response.BulkTaskUploadResponseDto.RowResultDto;
import com.ikon.taskmanagement.entity.Epic;
import com.ikon.taskmanagement.entity.Sprint;
import com.ikon.taskmanagement.entity.Task;
import com.ikon.taskmanagement.mapper.BulkUploadMapper;
import com.ikon.taskmanagement.repository.EpicRepository;
import com.ikon.taskmanagement.repository.ProjectRepository;
import com.ikon.taskmanagement.repository.SprintRepository;
import com.ikon.taskmanagement.repository.TaskRepository;
import com.ikon.taskmanagement.service.BulkTaskUploadService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class BulkTaskUploadServiceImpl implements BulkTaskUploadService {

    private final ProjectRepository projectRepository;
    private final EpicRepository epicRepository;
    private final SprintRepository sprintRepository;
    private final TaskRepository taskRepository;
    private final BulkUploadMapper bulkUploadMapper; // single mapper for all bulk mapping

    @Override
    @Transactional
    public BulkTaskUploadResponseDto bulkUpload(List<BulkTaskUploadRequestDto> rows) {

        List<RowErrorDto> errors = new ArrayList<>();
        List<RowResultDto> results = new ArrayList<>();

        // Validate ALL rows first (no DB calls)
        for (int i = 0; i < rows.size(); i++) {
            validateRow(rows.get(i), i + 1, errors);
        }

        // Any validation error → return immediately
        if (!errors.isEmpty()) {
            return BulkTaskUploadResponseDto.builder()
                    .totalRows(rows.size())
                    .createdCount(0)
                    .skippedCount(0)
                    .results(List.of())
                    .errors(errors)
                    .build();
        }

        // Process each row
        int createdCount = 0;
        int skippedCount = 0;

        for (int i = 0; i < rows.size(); i++) {
            RowResultDto result = processRow(rows.get(i), i + 1, errors);
            if (result != null) {
                results.add(result);
                if ("CREATED".equals(result.getTaskAction()))
                    createdCount++;
                else if ("SKIPPED".equals(result.getTaskAction()))
                    skippedCount++;
            }
        }

        // Runtime error → rollback
        if (!errors.isEmpty()) {
            return BulkTaskUploadResponseDto.builder()
                    .totalRows(rows.size())
                    .createdCount(0)
                    .skippedCount(0)
                    .results(List.of())
                    .errors(errors)
                    .build();
        }

        log.info("Bulk upload complete: {} created, {} skipped out of {} rows",
                createdCount, skippedCount, rows.size());

        return BulkTaskUploadResponseDto.builder()
                .totalRows(rows.size())
                .createdCount(createdCount)
                .skippedCount(skippedCount)
                .results(results)
                .errors(List.of())
                .build();
    }

    // Validate — required fields only, no DB

    private void validateRow(BulkTaskUploadRequestDto row, int rowNum, List<RowErrorDto> errors) {
        if (row.getProjectId() == null) {
            errors.add(buildError(rowNum, row, "projectId is required"));
            return;
        }
        if (isBlank(row.getEpicName())) {
            errors.add(buildError(rowNum, row, "epicName is required"));
            return;
        }
        if (isBlank(row.getSprintName())) {
            errors.add(buildError(rowNum, row, "sprintName is required"));
            return;
        }
        if (isBlank(row.getTitle())) {
            errors.add(buildError(rowNum, row, "title is required"));
        }
    }

    // Process one row: project → epic → sprint → task

    private RowResultDto processRow(BulkTaskUploadRequestDto row, int rowNum,
            List<RowErrorDto> errors) {
        try {

            // Project must exist
            if (!projectRepository.existsById(row.getProjectId())) {
                errors.add(buildError(rowNum, row,
                        "Project not found with id: '" + row.getProjectId() + "'"));
                return null;
            }

            // Epic: find or create
            EpicResult epicResult = findOrCreateEpic(row);

            // Sprint: find or create
            SprintResult sprintResult = findOrCreateSprint(row, epicResult.epicId());

            // Task: skip if duplicate, else create
            boolean taskExists = taskRepository
                    .existsByTitleIgnoreCaseAndSprintId(row.getTitle().trim(), sprintResult.sprintId());

            String taskAction;
            if (taskExists) {
                taskAction = "SKIPPED";
                log.info("Row {}: Task '{}' already exists in sprint '{}' — skipped",
                        rowNum, row.getTitle(), row.getSprintName());
            } else {
                // BulkUploadMapper handles all field mapping + prefix stripping
                Task task = bulkUploadMapper.toTaskEntity(row, epicResult.epicId(), sprintResult.sprintId());
                taskRepository.save(task);
                taskAction = "CREATED";
                log.info("Row {}: Task '{}' created", rowNum, row.getTitle());
            }

            return RowResultDto.builder()
                    .row(rowNum)
                    .epicName(row.getEpicName())
                    .sprintName(row.getSprintName())
                    .taskTitle(row.getTitle())
                    .epicAction(epicResult.action())
                    .sprintAction(sprintResult.action())
                    .taskAction(taskAction)
                    .message(buildMessage(
                            epicResult.action(), sprintResult.action(), taskAction,
                            row.getEpicName(), row.getSprintName(), row.getTitle()))
                    .build();

        } catch (Exception ex) {
            log.error("Row {}: Unexpected error — {}", rowNum, ex.getMessage(), ex);
            errors.add(buildError(rowNum, row, "Unexpected error: " + ex.getMessage()));
            return null;
        }
    }

    // Find or Create — Epic

    private EpicResult findOrCreateEpic(BulkTaskUploadRequestDto row) {
        return epicRepository
                .findByNameIgnoreCaseAndProjectId(row.getEpicName().trim(), row.getProjectId())
                .map(epic -> {
                    log.info("Epic FOUND: '{}' (id: {})", epic.getName(), epic.getId());
                    return new EpicResult(epic.getId(), "FOUND");
                })
                .orElseGet(() -> {
                    Epic saved = epicRepository.save(bulkUploadMapper.toEpicEntity(row));
                    log.info("Epic CREATED: '{}' (id: {})", saved.getName(), saved.getId());
                    return new EpicResult(saved.getId(), "CREATED");
                });
    }

    private SprintResult findOrCreateSprint(BulkTaskUploadRequestDto row, UUID epicId) {
        return sprintRepository
                .findByNameIgnoreCaseAndEpicId(row.getSprintName().trim(), epicId)
                .map(sprint -> {
                    log.info("Sprint FOUND: '{}' (id: {})", sprint.getName(), sprint.getId());
                    return new SprintResult(sprint.getId(), "FOUND");
                })
                .orElseGet(() -> {
                    Sprint saved = sprintRepository.save(bulkUploadMapper.toSprintEntity(row, epicId));
                    log.info("Sprint CREATED: '{}' (id: {})", saved.getName(), saved.getId());
                    return new SprintResult(saved.getId(), "CREATED");
                });
    }

    // Message builder

    private String buildMessage(String epicAction, String sprintAction, String taskAction,
            String epicName, String sprintName, String taskTitle) {
        return "Epic '" + epicName + "' " + ("CREATED".equals(epicAction) ? "created" : "already existed") + ". " +
                "Sprint '" + sprintName + "' " + ("CREATED".equals(sprintAction) ? "created" : "already existed") + ". "
                +
                "Task '" + taskTitle + "' "
                + ("CREATED".equals(taskAction) ? "created successfully." : "already exists — skipped.");
    }

    // Internal result records

    private record EpicResult(UUID epicId, String action) {
    }

    private record SprintResult(UUID sprintId, String action) {
    }

    // Helpers

    private boolean isBlank(String s) {
        return s == null || s.isBlank();
    }

    private RowErrorDto buildError(int rowNum, BulkTaskUploadRequestDto row, String reason) {
        return RowErrorDto.builder()
                .row(rowNum)
                .epicName(row.getEpicName())
                .sprintName(row.getSprintName())
                .taskTitle(row.getTitle())
                .reason(reason)
                .build();
    }
}