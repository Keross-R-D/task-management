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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.ikon.taskmanagement.entity.Project;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BulkTaskUploadServiceImpl implements BulkTaskUploadService {

    private final ProjectRepository projectRepository;
    private final EpicRepository epicRepository;
    private final SprintRepository sprintRepository;
    private final TaskRepository taskRepository;
    private final BulkUploadMapper mapper;

    enum Action {
        CREATED, FOUND, SKIPPED
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public BulkTaskUploadResponseDto bulkUpload(List<BulkTaskUploadRequestDto> rows) {
        
        // Statistics
        ProcessStats stats = new ProcessStats();
        List<RowErrorDto> errors = new ArrayList<>();
        List<RowResultDto> results = new ArrayList<>();
        
        // Validation phase
        for (int i = 0; i < rows.size(); i++) {
            validateRow(rows.get(i), i + 1, errors);
        }
        
        if (!errors.isEmpty()) {
            return buildErrorResponse(rows.size(), errors);
        }
        
        try {
            // Step 1: Get unique project IDs from all rows
            Set<UUID> projectIds = rows.stream()
                    .map(BulkTaskUploadRequestDto::getProjectId)
                    .collect(Collectors.toSet());
            
            // Step 2: Verify all projects exist in ONE query 
            List<Project> allProjects = projectRepository.findAllById(projectIds);
            Set<UUID> existingProjectIds = allProjects.stream()
                    .map(Project::getId)
                    .collect(Collectors.toSet());
            
            // Check for missing projects
            for (int i = 0; i < rows.size(); i++) {
                BulkTaskUploadRequestDto row = rows.get(i);
                int rowNum = i + 1;
                if (!existingProjectIds.contains(row.getProjectId())) {
                    errors.add(buildError(rowNum, row, "Project not found"));
                    throw new IllegalArgumentException("Project not found at row " + rowNum);
                }
            }
            
            // Step 3: Get unique epic IDs from all rows
            Set<UUID> epicIds = rows.stream()
                    .map(BulkTaskUploadRequestDto::getEpicId)
                    .collect(Collectors.toSet());
            
            // Step 4: Fetch all epics in ONE query
            List<Epic> allEpics = epicRepository.findAllById(epicIds);
            Map<UUID, Epic> epicCache = allEpics.stream()
                    .collect(Collectors.toMap(
                        Epic::getId,
                        epic -> epic
                    ));
            
            // Validate epics belong to their projects
            for (int i = 0; i < rows.size(); i++) {
                BulkTaskUploadRequestDto row = rows.get(i);
                int rowNum = i + 1;
                Epic epic = epicCache.get(row.getEpicId());
                
                if (epic == null || !epic.getProjectId().equals(row.getProjectId())) {
                    errors.add(buildError(rowNum, row, "Epic not found or does not belong to the specified project"));
                    throw new IllegalArgumentException("Epic not found at row " + rowNum);
                }
            }
            
            // Step 5: Fetch all existing sprints in ONE query
            // Create a set of unique sprint names
            Set<String> sprintNames = rows.stream()
                    .map(BulkTaskUploadRequestDto::getSprintName)
                    .filter(Objects::nonNull)
                    .map(String::trim)
                    .collect(Collectors.toSet());
            
            // Fetch all existing sprints for these epics with matching names
            List<Sprint> allExistingSprints = sprintRepository.findByEpicIdInAndNameInIgnoreCase(
                new ArrayList<>(epicIds), sprintNames);
            
            // Cache existing sprints using composite key
            Map<String, Sprint> sprintCache = new HashMap<>();
            for (Sprint sprint : allExistingSprints) {
                String key = sprint.getEpicId().toString() + "_" + sprint.getName().trim().toLowerCase();
                sprintCache.put(key, sprint);
            }
            
            // Step 6: Prepare new sprints to create
            Map<String, Sprint> newSprints = new HashMap<>();
            for (BulkTaskUploadRequestDto row : rows) {
                String key = row.getEpicId().toString() + "_" + row.getSprintName().trim().toLowerCase();
                
                if (!sprintCache.containsKey(key)) {
                    Epic epic = epicCache.get(row.getEpicId());
                    newSprints.put(key, mapper.toSprintEntity(row, epic.getId()));
                }
            }
            
            // Step 7: Batch save all new sprints
            if (!newSprints.isEmpty()) {
                List<Sprint> savedSprints = sprintRepository.saveAll(new ArrayList<>(newSprints.values()));
                for (Sprint sprint : savedSprints) {
                    String key = sprint.getEpicId().toString() + "_" + sprint.getName().trim().toLowerCase();
                    sprintCache.put(key, sprint);
                }
            }
            
            // Step 8: Separate rows with and without tasks
            // Check if title is null OR empty string OR blank
            List<BulkTaskUploadRequestDto> rowsWithTasks = rows.stream()
                    .filter(row -> row.getTitle() != null && !row.getTitle().trim().isEmpty())
                    .collect(Collectors.toList());
            
            List<BulkTaskUploadRequestDto> rowsWithoutTasks = rows.stream()
                    .filter(row -> row.getTitle() == null || row.getTitle().trim().isEmpty())
                    .collect(Collectors.toList());
            
            // Step 9: Process rows with tasks
            if (!rowsWithTasks.isEmpty()) {
                // Step 9a: Fetch all existing tasks for relevant sprints
                Set<UUID> relevantSprintIds = sprintCache.values().stream()
                        .map(Sprint::getId)
                        .collect(Collectors.toSet());
                
                // Fetch all existing tasks for these sprints in ONE query
                List<Task> allExistingTasks = taskRepository.findBySprintIdIn(relevantSprintIds);
                
                // Create a cache for existing tasks (sprintId + normalized title)
                Map<String, Task> taskCache = new HashMap<>();
                for (Task task : allExistingTasks) {
                    String key = task.getSprintId().toString() + "_" + task.getTitle().trim().toLowerCase();
                    taskCache.put(key, task);
                }
                
                // Step 9b: Process tasks
                List<Task> tasksToSave = new ArrayList<>();
                
                for (BulkTaskUploadRequestDto row : rowsWithTasks) {
                    int rowNum = getOriginalRowNumber(rows, row);
                    Epic epic = epicCache.get(row.getEpicId());
                    String sprintKey = epic.getId().toString() + "_" + row.getSprintName().trim().toLowerCase();
                    Sprint sprint = sprintCache.get(sprintKey);
                    
                    String taskKey = sprint.getId().toString() + "_" + row.getTitle().trim().toLowerCase();
                    boolean taskExists = taskCache.containsKey(taskKey);
                    
                    Action taskAction;
                    if (taskExists) {
                        taskAction = Action.SKIPPED;
                        stats.incrementSkipped();
                    } else {
                        tasksToSave.add(mapper.toTaskEntity(row, epic.getId(), sprint.getId()));
                        taskAction = Action.CREATED;
                        stats.incrementCreated();
                    }
                    
                    results.add(buildResult(
                        rowNum, 
                        row, 
                        Action.FOUND, 
                        Action.FOUND, 
                        taskAction
                    ));
                }
                
                // Step 9c: Batch save tasks
                if (!tasksToSave.isEmpty()) {
                    taskRepository.saveAll(tasksToSave);
                }
            }
            
            // Step 10: Process rows without tasks (sprint-only rows)
            for (BulkTaskUploadRequestDto row : rowsWithoutTasks) {
                int rowNum = getOriginalRowNumber(rows, row);
                Epic epic = epicCache.get(row.getEpicId());
                String sprintKey = epic.getId().toString() + "_" + row.getSprintName().trim().toLowerCase();
                Sprint sprint = sprintCache.get(sprintKey);
                
                // For sprint-only rows, we just create/use sprint and skip task creation
                results.add(buildResult(
                    rowNum, 
                    row, 
                    Action.FOUND, 
                    Action.FOUND, 
                    Action.SKIPPED  // Task is skipped because title is empty
                ));
            }
            
            return BulkTaskUploadResponseDto.builder()
                    .totalRows(rows.size())
                    .createdCount(stats.getCreatedCount())
                    .skippedCount(stats.getSkippedCount())
                    .results(results)
                    .errors(errors)
                    .build();
                    
        } catch (Exception ex) {
            log.error("Bulk upload failed", ex);
            throw new RuntimeException("Bulk upload failed", ex);
        }
    }
    
    // ================= HELPER CLASS FOR STATS =================
    
    private static class ProcessStats {
        private int createdCount = 0;
        private int skippedCount = 0;
        
        void incrementCreated() { createdCount++; }
        void incrementSkipped() { skippedCount++; }
        int getCreatedCount() { return createdCount; }
        int getSkippedCount() { return skippedCount; }
    }
    
    // ================= VALIDATION & UTILITY METHODS =================
    
    private void validateRow(BulkTaskUploadRequestDto row, int rowNum, List<RowErrorDto> errors) {
        if (row.getProjectId() == null) {
            errors.add(buildError(rowNum, row, "projectId required"));
        } else if (row.getEpicId() == null) {
            errors.add(buildError(rowNum, row, "epicId required"));
        } else if (isBlank(row.getSprintName())) {
            errors.add(buildError(rowNum, row, "sprintName required"));
        }
    }
    
    private boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
    
    private boolean isEmptyOrBlank(String s) {
        return s == null || s.trim().isEmpty();
    }
    
    private int getOriginalRowNumber(List<BulkTaskUploadRequestDto> allRows, BulkTaskUploadRequestDto targetRow) {
        for (int i = 0; i < allRows.size(); i++) {
            BulkTaskUploadRequestDto row = allRows.get(i);
            if (row == targetRow) {
                return i + 1;
            }
        }
        return -1;
    }
    
    private RowErrorDto buildError(int row, BulkTaskUploadRequestDto r, String msg) {
        return RowErrorDto.builder()
                .row(row)
                .epicName(r.getEpicId() != null ? r.getEpicId().toString() : "")
                .sprintName(r.getSprintName())
                .taskTitle(r.getTitle())
                .reason(msg)
                .build();
    }
    
    private RowResultDto buildResult(int rowNum, BulkTaskUploadRequestDto row,
                                    Action epicAction, Action sprintAction, Action taskAction) {
        String taskTitleDisplay = (row.getTitle() == null || row.getTitle().trim().isEmpty()) 
            ? "[No Task - Sprint Only]" 
            : row.getTitle();
            
        String taskMessageDisplay = (row.getTitle() == null || row.getTitle().trim().isEmpty())
            ? "No Task"
            : row.getTitle();
            
        return RowResultDto.builder()
                .row(rowNum)
                .epicName(row.getEpicId().toString())
                .sprintName(row.getSprintName())
                .taskTitle(taskTitleDisplay)
                .epicAction(epicAction.name())
                .sprintAction(sprintAction.name())
                .taskAction(taskAction.name())
                .message(String.format("Epic '%s' %s, Sprint '%s' %s, Task '%s' %s",
                    row.getEpicId(), epicAction,
                    row.getSprintName(), sprintAction,
                    taskMessageDisplay, taskAction))
                .build();
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