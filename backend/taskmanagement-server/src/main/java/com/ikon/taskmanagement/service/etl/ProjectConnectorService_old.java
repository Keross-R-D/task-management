package com.ikon.taskmanagement.service.etl;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.Optional;
import java.util.Comparator;
import java.util.stream.Collectors;

import com.ikon.connector.dto.response.ConnectionResponse;
import com.ikon.connector.dto.response.ConnectorConfigResponse;
import com.ikon.connector.service.ConnectionService;
import com.ikon.connector.service.ConnectorConfigService;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ikon.connector.dto.response.FieldsConfigDto;
import com.ikon.connector.spi.ConnectorDataSync;
import com.ikon.dac.annotation.RequireRole;
import com.ikon.taskmanagement.dto.request.ProjectRequestDto;
import com.ikon.taskmanagement.entity.Project;
import com.ikon.taskmanagement.enums.ProjectStatus;
import com.ikon.taskmanagement.repository.ProjectRepository;
import com.ikon.taskmanagement.service.ProjectService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class ProjectConnectorService_old implements ConnectorDataSync {

    private final ProjectService projectService;
    private final ProjectRepository projectRepository;
    private final ObjectMapper objectMapper;
    private final ConnectionService connectionService;
    private final ConnectorConfigService configService;

    @Override
    public List<FieldsConfigDto> getFieldsConfig() {
        List<FieldsConfigDto> fieldsConfig = new ArrayList<>();
        fieldsConfig.add(FieldsConfigDto.builder().key("id").label("ID").type("string").build());
        fieldsConfig.add(FieldsConfigDto.builder().key("projectName").label("Project Name").type("string").build());
        fieldsConfig.add(FieldsConfigDto.builder().key("clientName").label("Client Name").type("string").build());
        fieldsConfig.add(FieldsConfigDto.builder().key("managerId").label("Manager ID").type("string").build());
        fieldsConfig.add(
                FieldsConfigDto.builder().key("managerDelegateId").label("Manager Delegate ID").type("string").build());
        fieldsConfig.add(FieldsConfigDto.builder().key("startDate").label("Start Date").type("string").build());
        fieldsConfig.add(FieldsConfigDto.builder().key("endDate").label("End Date").type("string").build());
        fieldsConfig.add(FieldsConfigDto.builder().key("projectStatus").label("Project Status").type("string").build());
        fieldsConfig.add(FieldsConfigDto.builder().key("type").label("Type").type("string").build());
        fieldsConfig.add(FieldsConfigDto.builder().key("teamMemberIds").label("Team Member IDs").type("array").build());
        return fieldsConfig;
    }

    @Override
    public String getModule() {
        return "Project";
    }

    @Override
    @Transactional
    public void syncBatch(List<Map<String, Object>> payload) {

        Optional<ConnectorConfigResponse> projectConfig = configService.getAllConnectorConfigs().stream()
                .filter(c -> "Project".equals(c.getAvailableModule()))
                .max(Comparator.comparing(ConnectorConfigResponse::getCreatedAt));

        UUID accountId = null;
        if (projectConfig.isPresent()) {
            Optional<ConnectionResponse> projectConnection = connectionService.getConnections().stream()
                    .filter(conn -> conn.getConnectorConfig() != null &&
                            projectConfig.get().getId().equals(conn.getConnectorConfig().getId()))
                    .max(Comparator.comparing(ConnectionResponse::getCreatedAt));
            if (projectConnection.isPresent()) {
                accountId = projectConnection.get().getAccountId();
            }
        }
        final UUID finalAccountId = accountId;

        // ── Step 1: Map all incoming rows to DTOs ────────────────────────────
        List<ProjectRequestDto> requests = payload.stream()
                .map(data -> {
                    ProjectRequestDto request = new ProjectRequestDto();
                    request.setId(parseUUID(data.get("id")));
                    request.setAccountId(finalAccountId);
                    request.setProjectName(toStr(data.get("projectName")));
                    request.setClientName(toStr(data.get("clientName")));
                    request.setManagerId(parseUUID(data.get("managerId")));
                    request.setManagerDelegateId(parseUUID(data.get("managerDelegateId")));
                    request.setStartDate(parseDate(toStr(data.get("startDate"))));
                    request.setEndDate(parseDate(toStr(data.get("endDate"))));
                    request.setProjectStatus(toStr(data.get("projectStatus")));
                    request.setType(toStr(data.get("type")));
                    request.setTeamMemberIds(parseUUIDList(data.get("teamMemberIds")));
                    return request;
                })
                .collect(Collectors.toList());

        // ── Step 2: Collect keys from incoming batch ─────────────────────────
        List<String> incomingNames = requests.stream()
                .map(ProjectRequestDto::getProjectName)
                .filter(name -> name != null && !name.isBlank())
                .distinct()
                .collect(Collectors.toList());

        List<UUID> incomingManagerIds = requests.stream()
                .map(ProjectRequestDto::getManagerId)
                .filter(id -> id != null)
                .distinct()
                .collect(Collectors.toList());

        // ── Step 3: Single DB call to find all existing matches ──────────────
        List<Project> existingProjects = projectRepository
                .findAllByProjectNameInAndManagerIdIn(incomingNames, incomingManagerIds);

        // Build a composite key Set: "projectname::managerId" for O(1) lookup
        Set<String> existingKeys = existingProjects.stream()
                .map(p -> compositeKey(p.getProjectName(), p.getManagerId()))
                .collect(Collectors.toSet());

        // ── Step 4: Filter out duplicates and map to entities ────────────────
        List<ProjectRequestDto> toCreate = requests.stream()
                .filter(req -> {
                    String key = compositeKey(req.getProjectName(), req.getManagerId());
                    if (existingKeys.contains(key)) {
                        log.warn("Skipping duplicate project — name: '{}', managerId: '{}'",
                                req.getProjectName(), req.getManagerId());
                        return false;
                    }
                    return true;
                })
                .collect(Collectors.toList());

        // ── Step 5: Create new projects through service to enforce access control ──
        if (!toCreate.isEmpty()) {
            toCreate.forEach(req -> {
                try {
                    projectService.createProject(req);
                } catch (Exception e) {
                    log.error("Failed to create project for request {}: {}", req, e.getMessage(), e);
                }
            });
            log.info("Processed {} new project(s). Skipped {} duplicate(s).",
                    toCreate.size(), requests.size() - toCreate.size());
        } else {
            log.info("No new projects to save. All {} record(s) already exist.", requests.size());
        }
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private String compositeKey(String projectName, UUID managerId) {
        return (projectName == null ? "" : projectName.toLowerCase())
                + "::"
                + (managerId == null ? "" : managerId.toString());
    }

    private UUID parseUUID(Object value) {
        if (value == null)
            return null;
        try {
            return UUID.fromString(value.toString());
        } catch (Exception e) {
            return null;
        }
    }

    private List<UUID> parseUUIDList(Object value) {
        if (value == null)
            return new ArrayList<>();

        try {
            // If upstream already deserialized it to a List
            if (value instanceof List<?> list) {
                return list.stream()
                        .filter(item -> item != null)
                        .map(item -> UUID.fromString(item.toString()))
                        .collect(Collectors.toList());
            }

            // Otherwise treat it as a JSON string e.g. "[\"uuid1\",\"uuid2\"]"
            List<String> ids = objectMapper.readValue(
                    value.toString(),
                    new com.fasterxml.jackson.core.type.TypeReference<List<String>>() {
                    });

            return ids.stream()
                    .map(UUID::fromString)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Failed to parse teamMemberIds: {}", value, e);
            return new ArrayList<>();
        }
    }

    private LocalDate parseDate(String value) {
        if (value == null || value.isBlank())
            return null;
        try {
            return LocalDate.parse(value);
        } catch (DateTimeParseException e) {
            return null;
        }
    }

    private ProjectStatus parseProjectStatus(Object value) {
        if (value == null)
            return ProjectStatus.PLANNED;
        try {
            return ProjectStatus.valueOf(value.toString().toUpperCase());
        } catch (IllegalArgumentException e) {
            return ProjectStatus.PLANNED;
        }
    }

    private String toStr(Object value) {
        return value != null ? String.valueOf(value) : null;
    }
}