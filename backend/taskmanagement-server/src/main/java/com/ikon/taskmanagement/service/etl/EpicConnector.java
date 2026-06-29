package com.ikon.taskmanagement.service.etl;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ikon.connector.dto.response.FieldsConfigDto;
import com.ikon.connector.spi.ConnectorDataSync;
import com.ikon.taskmanagement.dto.request.EpicRequestDto;
import com.ikon.taskmanagement.entity.Epic;
import com.ikon.taskmanagement.entity.Project;
import com.ikon.taskmanagement.mapper.EpicMapper;
import com.ikon.taskmanagement.repository.EpicRepository;
import com.ikon.taskmanagement.repository.ProjectRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class EpicConnector implements ConnectorDataSync {

    private final EpicRepository epicRepository;
    private final ProjectRepository projectRepository;
    private final ObjectMapper objectMapper;
    private final EpicMapper epicMapper;

    @Override
    public List<FieldsConfigDto> getFieldsConfig() {
        List<FieldsConfigDto> fieldsConfig = new ArrayList<>();
        fieldsConfig.add(FieldsConfigDto.builder().key("task").label("Schedules").type("array").build());
        fieldsConfig.add(FieldsConfigDto.builder().key("projectId").label("Project ID").type("string").build());
        return fieldsConfig;
    }

    @Override
    public String getModule() {
        return "Epic";
    }

    @Override
    @Transactional
    public void syncBatch(List<Map<String, Object>> payload) {

        // Step 1: Flatten each project's "task" JSON array into individual EpicRequestDto objects
        List<EpicRequestDto> requests = new ArrayList<>();

        for (Map<String, Object> projectEntry : payload) {
            UUID projectId = parseUUID(projectEntry.get("projectId"));
            String taskJson = toStr(projectEntry.get("task"));

            if (taskJson == null || taskJson.isBlank()) {
                continue;
            }

            List<Map<String, Object>> tasks;
            try {
                tasks = objectMapper.readValue(taskJson,
                        new com.fasterxml.jackson.core.type.TypeReference<List<Map<String, Object>>>() {
                        });
            } catch (Exception e) {
                log.error("Failed to parse task JSON for projectId '{}': {}", projectId, e.getMessage(), e);
                continue;
            }

            for (Map<String, Object> task : tasks) {
                EpicRequestDto request = new EpicRequestDto();
                request.setEpicNumber(parseLong(task.get("id")));
                request.setProjectId(projectId);
                request.setName(toStr(task.get("taskName")));
                request.setDescription(toStr(task.get("taskDescription")));
                request.setStartDate(parseDate(toStr(task.get("taskStart"))));
                request.setEndDate(parseDate(toStr(task.get("taskEnd"))));
                requests.add(request);
            }
        }

        if (requests.isEmpty()) {
            log.info("No valid epic requests found in payload. Skipping sync.");
            return;
        }

        // Step 2: Validate that all projects exist in the database
        // Collect distinct projectIds from requests
        List<UUID> incomingProjectIds = requests.stream()
                .map(EpicRequestDto::getProjectId)
                .filter(id -> id != null)
                .distinct()
                .collect(Collectors.toList());

        // Fetch all projects with their accountIds
        Map<UUID, Project> projectMap = projectRepository.findAllById(incomingProjectIds)
                .stream()
                .collect(Collectors.toMap(Project::getId, project -> project));

        // Check which projectIds exist in the database
        Set<UUID> existingProjectIds = projectMap.keySet();

        // Filter out requests whose projects don't exist
        List<EpicRequestDto> filteredRequests = requests.stream()
                .filter(req -> {
                    if (req.getProjectId() == null) {
                        log.warn("Skipping epic with null projectId: {}", req.getEpicNumber());
                        return false;
                    }
                    if (!existingProjectIds.contains(req.getProjectId())) {
                        log.warn("Skipping epic - Project not found in database: projectId='{}', epicNumber='{}'",
                                req.getProjectId(), req.getEpicNumber());
                        return false;
                    }
                    return true;
                })
                .collect(Collectors.toList());

        if (filteredRequests.isEmpty()) {
            log.info("No valid epics with existing projects found in payload. Skipping sync.");
            return;
        }

        // Step 3: Collect distinct projectIds and epicNumbers from filtered requests
        List<UUID> validProjectIds = filteredRequests.stream()
                .map(EpicRequestDto::getProjectId)
                .filter(id -> id != null)
                .distinct()
                .collect(Collectors.toList());

        List<Long> incomingEpicNumbers = filteredRequests.stream()
                .map(EpicRequestDto::getEpicNumber)
                .filter(id -> id != null)
                .distinct()
                .collect(Collectors.toList());

        // Step 4: Fetch DB, build set of existing (projectId, epicNumber) composite keys
        Set<String> existingKeys = epicRepository
                .findAllByProjectIdInAndEpicNumberIn(validProjectIds, incomingEpicNumbers)
                .stream()
                .map(epic -> compositeKey(epic.getProjectId(), epic.getEpicNumber()))
                .collect(Collectors.toSet());

        // Step 5: Drop requests that already exist for that project+epicNumber combo
        List<EpicRequestDto> newRequests = new ArrayList<>();
        for (EpicRequestDto req : filteredRequests) {
            String key = compositeKey(req.getProjectId(), req.getEpicNumber());

            if (req.getEpicNumber() != null && !existingKeys.add(key)) {
                log.warn("Epic already exists — projectId: '{}', epicNumber: '{}'. Skipping.",
                        req.getProjectId(), req.getEpicNumber());
                continue;
            }

            newRequests.add(req);
        }

        if (newRequests.isEmpty()) {
            log.info("All epics in payload already exist. Nothing to create.");
            return;
        }

        // Step 6: Batch-create the new epics with access control rules
        try {
            if (newRequests == null || newRequests.isEmpty()) {
                return;
            }

            Map<UUID, List<EpicRequestDto>> byProject = newRequests.stream()
                    .collect(Collectors.groupingBy(EpicRequestDto::getProjectId, LinkedHashMap::new, Collectors.toList()));

            List<Epic> entitiesToSave = new ArrayList<>();

            for (Map.Entry<UUID, List<EpicRequestDto>> entry : byProject.entrySet()) {
                UUID projectId = entry.getKey();
                List<EpicRequestDto> projectDtos = entry.getValue();

                // Get the project from the map we created earlier
                Project project = projectMap.get(projectId);
                
                if (project == null) {
                    log.error("Project not found for ID: {} even though it passed validation. Skipping all epics for this project.", projectId);
                    continue;
                }

                // Get accountId from the project entity
                UUID accountId = project.getAccountId();
                
                if (accountId == null) {
                    log.error("Project {} has null accountId. Skipping all epics for this project.", projectId);
                    continue;
                }   

                String teamMemberGroup = "TeamMember_" + project.getId();
                String pmGroup = "ProjectManager_" + project.getId();
                String delegateGroup = "ManagerDelegate_" + project.getId();

                Set<String> readGroups = Set.of(teamMemberGroup, pmGroup, delegateGroup);
                Set<String> writeGroups = Set.of(pmGroup, delegateGroup);

                for (EpicRequestDto dto : projectDtos) {
                    Epic entity = epicMapper.mapToEntity(dto);
                    entity.setAccountId(accountId); // Now using accountId from project
                    entity.setReadGroups(new HashSet<>(readGroups));
                    entity.setWriteGroups(new HashSet<>(writeGroups));
                    entitiesToSave.add(entity);
                }
            }

            // single bulk persist
            List<Epic> saved = epicRepository.saveAll(entitiesToSave);
            log.info("Successfully created {} epics", saved.size());
            
        } catch (Exception e) {
            log.error("Failed to batch-create {} epic(s): {}", newRequests.size(), e.getMessage(), e);
        }
    }

    private Long parseLong(Object value) {
        if (value == null) return null;
        try {
            return Long.parseLong(value.toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private String compositeKey(UUID projectId, Long epicNumber) {
        return (projectId == null ? "" : projectId.toString()) + "::" + (epicNumber == null ? "" : epicNumber.toString());
    }

    private UUID parseUUID(Object value) {
        if (value == null) return null;
        try {
            return UUID.fromString(value.toString());
        } catch (Exception e) {
            return null;
        }
    }

    private LocalDate parseDate(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return LocalDate.parse(value);
        } catch (DateTimeParseException e) {
            return null;
        }
    }

    private String toStr(Object value) {
        return value != null ? String.valueOf(value) : null;
    }
}