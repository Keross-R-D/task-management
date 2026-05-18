package com.ikon.taskmanagement.service.impl;

import com.ikon.taskmanagement.dto.request.BulkTaskUploadRequestDto;
import com.ikon.taskmanagement.dto.response.BulkTaskUploadResponseDto;
import com.ikon.taskmanagement.dto.response.BulkTaskUploadResponseDto.RowErrorDto;
import com.ikon.taskmanagement.dto.response.BulkTaskUploadResponseDto.RowResultDto;
import com.ikon.taskmanagement.entity.Epic;
import com.ikon.taskmanagement.entity.Sprint;
import com.ikon.taskmanagement.entity.Task;
import com.ikon.taskmanagement.mapper.BulkUploadMapper;
import com.ikon.taskmanagement.repository.*;
import com.ikon.taskmanagement.service.BulkTaskUploadService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class BulkTaskUploadServiceImpl implements BulkTaskUploadService {

    private final ProjectRepository projectRepository;
    private final EpicRepository epicRepository;
    private final SprintRepository sprintRepository;
    private final TaskRepository taskRepository;
    private final BulkUploadMapper mapper;

    // Enum instead of String
    enum Action {
        CREATED, FOUND, SKIPPED
    }

    @Override
    @Transactional
    public BulkTaskUploadResponseDto bulkUpload(List<BulkTaskUploadRequestDto> rows) {

        List<RowErrorDto> errors = new ArrayList<>();
        List<RowResultDto> results = new ArrayList<>();

        // Phase 1: Validate
        for (int i = 0; i < rows.size(); i++) {
            validateRow(rows.get(i), i + 1, errors);
        }

        if (!errors.isEmpty()) {
            return buildErrorResponse(rows.size(), errors);
        }

        // Caches to avoid repeated DB calls
        Map<String, Epic> epicCache = new HashMap<>();
        Map<String, Sprint> sprintCache = new HashMap<>();

        List<Task> tasksToSave = new ArrayList<>();

        int createdCount = 0;
        int skippedCount = 0;

        for (int i = 0; i < rows.size(); i++) {
            int rowNum = i + 1;
            BulkTaskUploadRequestDto row = rows.get(i);

            try {
                // Check project once per row
                if (!projectRepository.existsById(row.getProjectId())) {
                    errors.add(buildError(rowNum, row, "Project not found"));
                    continue;
                }

                // Epic (cache key)
                String epicKey = row.getProjectId() + "_" + row.getEpicName().trim().toLowerCase();
                Epic epic = epicCache.get(epicKey);

                Action epicAction;

                if (epic == null) {
                    Optional<Epic> existing = epicRepository
                            .findByNameIgnoreCaseAndProjectId(row.getEpicName().trim(), row.getProjectId());

                    if (existing.isPresent()) {
                        epic = existing.get();
                        epicAction = Action.FOUND;
                    } else {
                        epic = mapper.toEpicEntity(row);
                        epic = epicRepository.save(epic);
                        epicAction = Action.CREATED;
                    }
                    epicCache.put(epicKey, epic);
                } else {
                    epicAction = Action.FOUND;
                }

                // Sprint (cache key)
                String sprintKey = epic.getId() + "_" + row.getSprintName().trim().toLowerCase();
                Sprint sprint = sprintCache.get(sprintKey);

                Action sprintAction;

                if (sprint == null) {
                    Optional<Sprint> existing = sprintRepository
                            .findByNameIgnoreCaseAndEpicId(row.getSprintName().trim(), epic.getId());

                    if (existing.isPresent()) {
                        sprint = existing.get();
                        sprintAction = Action.FOUND;
                    } else {
                        sprint = mapper.toSprintEntity(row, epic.getId());
                        sprint = sprintRepository.save(sprint);
                        sprintAction = Action.CREATED;
                    }
                    sprintCache.put(sprintKey, sprint);
                } else {
                    sprintAction = Action.FOUND;
                }

                // Task duplicate check
                boolean exists = taskRepository
                        .existsByTitleIgnoreCaseAndSprintId(row.getTitle().trim(), sprint.getId());

                Action taskAction;

                if (exists) {
                    taskAction = Action.SKIPPED;
                    skippedCount++;
                } else {
                    Task task = mapper.toTaskEntity(row, epic.getId(), sprint.getId());
                    tasksToSave.add(task);
                    taskAction = Action.CREATED;
                    createdCount++;
                }

                results.add(buildResult(rowNum, row, epicAction, sprintAction, taskAction));

            } catch (DataIntegrityViolationException ex) {
                log.error("Row {} DB error", rowNum, ex);
                errors.add(buildError(rowNum, row, "DB constraint violation"));
            } catch (Exception ex) {
                log.error("Row {} unexpected error", rowNum, ex);
                errors.add(buildError(rowNum, row, "Unexpected error"));
            }
        }

        // Batch insert
        if (!tasksToSave.isEmpty()) {
            taskRepository.saveAll(tasksToSave);
        }

        return BulkTaskUploadResponseDto.builder()
                .totalRows(rows.size())
                .createdCount(createdCount)
                .skippedCount(skippedCount)
                .results(results)
                .errors(errors)
                .build();
    }

    // ---------------- HELPERS ----------------

    private void validateRow(BulkTaskUploadRequestDto row, int rowNum, List<RowErrorDto> errors) {
        if (row.getProjectId() == null)
            errors.add(buildError(rowNum, row, "projectId required"));
        else if (isBlank(row.getEpicName()))
            errors.add(buildError(rowNum, row, "epicName required"));
        else if (isBlank(row.getSprintName()))
            errors.add(buildError(rowNum, row, "sprintName required"));
        else if (isBlank(row.getTitle()))
            errors.add(buildError(rowNum, row, "title required"));
    }

    private boolean isBlank(String s) {
        return s == null || s.isBlank();
    }

    private RowErrorDto buildError(int row, BulkTaskUploadRequestDto r, String msg) {
        return RowErrorDto.builder()
                .row(row)
                .epicName(r.getEpicName())
                .sprintName(r.getSprintName())
                .taskTitle(r.getTitle())
                .reason(msg)
                .build();
    }

    private RowResultDto buildResult(int rowNum, BulkTaskUploadRequestDto row,
                                     Action epicAction, Action sprintAction, Action taskAction) {

        return RowResultDto.builder()
                .row(rowNum)
                .epicName(row.getEpicName())
                .sprintName(row.getSprintName())
                .taskTitle(row.getTitle())
                .epicAction(epicAction.name())
                .sprintAction(sprintAction.name())
                .taskAction(taskAction.name())
                .message(buildMessage(epicAction, sprintAction, taskAction, row))
                .build();
    }

    private String buildMessage(Action epic, Action sprint, Action task, BulkTaskUploadRequestDto row) {
        return "Epic '" + row.getEpicName() + "' " + epic +
                ", Sprint '" + row.getSprintName() + "' " + sprint +
                ", Task '" + row.getTitle() + "' " + task;
    }

    private BulkTaskUploadResponseDto buildErrorResponse(int total, List<RowErrorDto> errors) {
        return BulkTaskUploadResponseDto.builder()
                .totalRows(total)
                .createdCount(0)
                .skippedCount(0)
                .results(List.of())
                .errors(errors)
                .build();
    }
}