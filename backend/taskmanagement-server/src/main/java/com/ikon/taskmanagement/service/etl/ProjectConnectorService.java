package com.ikon.taskmanagement.service.etl;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Comparator;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ikon.app.core.properties.IkonApplicationProperties;
import com.ikon.appaccessmanagement.entity.group.IkonGroup;
import com.ikon.appaccessmanagement.enums.GroupType;
import com.ikon.appaccessmanagement.service.IkonGroupService;
import com.ikon.connector.dto.response.ConnectionResponse;
import com.ikon.connector.dto.response.ConnectorConfigResponse;
import com.ikon.connector.dto.response.FieldsConfigDto;
import com.ikon.connector.service.ConnectionService;
import com.ikon.connector.service.ConnectorConfigService;
import com.ikon.connector.spi.ConnectorDataSync;
import com.ikon.taskmanagement.entity.Project;
import com.ikon.taskmanagement.enums.ProjectStatus;
import com.ikon.taskmanagement.repository.ProjectRepository;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class ProjectConnectorService implements ConnectorDataSync {

    private final ProjectRepository projectRepository;
    private final ObjectMapper objectMapper;
    private final ConnectionService connectionService;
    private final ConnectorConfigService configService;
    private final IkonGroupService ikonGroupService;
    private final IkonApplicationProperties applicationProperties;

    public ProjectConnectorService(
            ProjectRepository projectRepository,
            ObjectMapper objectMapper,
            @org.springframework.context.annotation.Lazy ConnectionService connectionService,
            @org.springframework.context.annotation.Lazy ConnectorConfigService configService,
            IkonGroupService ikonGroupService,
            IkonApplicationProperties applicationProperties) {
        this.projectRepository = projectRepository;
        this.objectMapper = objectMapper;
        this.connectionService = connectionService;
        this.configService = configService;
        this.ikonGroupService = ikonGroupService;
        this.applicationProperties = applicationProperties;
    }

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

    /**
     * System-level bulk sync — bypasses ProjectService (and its
     * WebService/SecurityContext dependency) entirely.
     *
     * Logic:
     * 1. Resolve accountId from the connector's Connection entity.
     * 2. Parse incoming payload into Project entities.
     * 3. Fetch existing projects by incoming IDs (single DB call).
     * 4. For each incoming project:
     * - If it exists and any tracked field has changed → update it.
     * - If it exists and nothing changed → skip it.
     * - If it doesn't exist → insert it.
     * 5. Create dynamic groups for all newly inserted projects.
     */
    @Override
    @Transactional
    public void syncBatch(List<Map<String, Object>> payload) {

        // ── Resolve accountId from the Connection entity ─────────────────────
        UUID accountId = resolveAccountIdFromConnection();
        if (accountId == null) {
            log.warn(
                    "Could not resolve accountId from connector connection. Projects will be saved without accountId.");
        }

        // ── Step 1: Parse incoming payload into Project entities ──────────────
        List<Project> incomingProjects = payload.stream()
                .map(data -> {
                    Project project = new Project();
                    UUID id = parseUUID(data.get("id"));
                    project.setId(id != null ? id : UUID.randomUUID());
                    project.setProjectName(toStr(data.get("projectName")));
                    project.setClientName(toStr(data.get("clientName")));
                    project.setManagerId(parseUUID(data.get("managerId")));
                    project.setManagerDelegateId(parseUUID(data.get("managerDelegateId")));
                    project.setStartDate(parseDate(toStr(data.get("startDate"))));
                    project.setEndDate(parseDate(toStr(data.get("endDate"))));
                    project.setProjectStatus(toStr(data.get("projectStatus")));
                    project.setType(toStr(data.get("type")));
                    project.setTeamMemberIds(parseUUIDList(data.get("teamMemberIds")));
                    project.setAccountId(accountId);
                    return project;
                })
                .collect(Collectors.toList());

        // ── Step 2: Collect incoming IDs ─────────────────────────────────────
        List<UUID> incomingIds = incomingProjects.stream()
                .map(Project::getId)
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());

        // ── Step 3: Single DB call to find all existing projects by ID ───────
        Map<UUID, Project> existingById = projectRepository.findAllById(incomingIds).stream()
                .collect(Collectors.toMap(Project::getId, Function.identity()));

        // Track old group-related field values before they get overwritten by applyFieldUpdates
        Map<UUID, UUID> oldManagerIds = new java.util.HashMap<>();
        Map<UUID, UUID> oldDelegateIds = new java.util.HashMap<>();
        Map<UUID, List<UUID>> oldTeamMemberIds = new java.util.HashMap<>();

        // ── Step 4: Classify into inserts, updates, and skips ────────────────
        List<Project> toInsert = new ArrayList<>();
        List<Project> toUpdate = new ArrayList<>();
        int skippedCount = 0;

        for (Project incoming : incomingProjects) {
            Project existing = existingById.get(incoming.getId());

            if (existing == null) {
                // New project — set dynamic/write groups before insert
                String teamMemberGroup = "TeamMember_" + incoming.getId();
                String pmGroup = "ProjectManager_" + incoming.getId();
                String delegateGroup = "ManagerDelegate_" + incoming.getId();
                incoming.setDynamicGroups(new HashSet<>(Set.of(teamMemberGroup, pmGroup, delegateGroup)));
                incoming.setWriteGroups(new HashSet<>(Set.of(pmGroup, delegateGroup)));
                toInsert.add(incoming);
            } else if (hasFieldChanges(existing, incoming)) {
                // Capture old values before overwriting
                oldManagerIds.put(existing.getId(), existing.getManagerId());
                oldDelegateIds.put(existing.getId(), existing.getManagerDelegateId());
                oldTeamMemberIds.put(existing.getId(),
                        existing.getTeamMemberIds() != null ? new ArrayList<>(existing.getTeamMemberIds()) : null);
                // Apply the field updates
                applyFieldUpdates(existing, incoming);
                toUpdate.add(existing);
            } else {
                // Existing project with no changes — skip
                skippedCount++;
            }
        }

        // ── Step 5: Save inserts ─────────────────────────────────────────────
        if (!toInsert.isEmpty()) {
            List<Project> savedProjects = projectRepository.saveAll(toInsert);
            // Create dynamic groups and assign memberships for newly inserted projects
            for (Project saved : savedProjects) {
                try {
                    createDynamicGroupsForProject(saved, accountId);
                } catch (Exception e) {
                    log.error("Failed to create dynamic groups for project '{}': {}",
                            saved.getProjectName(), e.getMessage(), e);
                }
            }
            log.info("Inserted {} new project(s).", savedProjects.size());
        }

        // ── Step 6: Save updates and sync group memberships ──────────────────
        if (!toUpdate.isEmpty()) {
            projectRepository.saveAll(toUpdate);
            // Update group memberships for projects where group-related fields changed
            for (Project updated : toUpdate) {
                try {
                    updateGroupMembershipsIfNeeded(
                            updated,
                            oldManagerIds.get(updated.getId()),
                            oldDelegateIds.get(updated.getId()),
                            oldTeamMemberIds.get(updated.getId()),
                            accountId);
                } catch (Exception e) {
                    log.error("Failed to update group memberships for project '{}': {}",
                            updated.getProjectName(), e.getMessage(), e);
                }
            }
            log.info("Updated {} project(s) with changed fields.", toUpdate.size());
        }

        if (skippedCount > 0) {
            log.info("Skipped {} project(s) with no changes.", skippedCount);
        }
    }

    // ── Field change detection ──────────────────────────────────────────────

    /**
     * Compares tracked fields between existing and incoming project.
     * Returns true if any field value has changed.
     */
    private boolean hasFieldChanges(Project existing, Project incoming) {
        return !Objects.equals(existing.getProjectName(), incoming.getProjectName())
                || !Objects.equals(existing.getClientName(), incoming.getClientName())
                || !Objects.equals(existing.getManagerId(), incoming.getManagerId())
                || !Objects.equals(existing.getManagerDelegateId(), incoming.getManagerDelegateId())
                || !Objects.equals(existing.getStartDate(), incoming.getStartDate())
                || !Objects.equals(existing.getEndDate(), incoming.getEndDate())
                || !Objects.equals(existing.getType(), incoming.getType())
                || !areTeamMemberIdsEqual(existing.getTeamMemberIds(), incoming.getTeamMemberIds());
    }

    /**
     * Applies field values from incoming to existing entity.
     */
    private void applyFieldUpdates(Project existing, Project incoming) {
        existing.setProjectName(incoming.getProjectName());
        existing.setClientName(incoming.getClientName());
        existing.setManagerId(incoming.getManagerId());
        existing.setManagerDelegateId(incoming.getManagerDelegateId());
        existing.setStartDate(incoming.getStartDate());
        existing.setEndDate(incoming.getEndDate());
        existing.setType(incoming.getType());
        existing.setTeamMemberIds(incoming.getTeamMemberIds());
    }

    /**
     * Compares two teamMemberIds lists regardless of order.
     */
    private boolean areTeamMemberIdsEqual(List<UUID> list1, List<UUID> list2) {
        if (list1 == null && list2 == null)
            return true;
        if (list1 == null || list2 == null)
            return false;
        return new HashSet<>(list1).equals(new HashSet<>(list2));
    }

    // ── Group membership update for existing projects ────────────────────────

    /**
     * After an update, checks if managerId, managerDelegateId, or teamMemberIds
     * changed and updates the corresponding dynamic group memberships.
     */
    private void updateGroupMembershipsIfNeeded(Project updated, UUID oldManagerId,
            UUID oldDelegateId, List<UUID> oldTeamMembers, UUID accountId) {
        UUID projectId = updated.getId();

        // TeamMember group — if teamMemberIds changed
        if (!areTeamMemberIdsEqual(oldTeamMembers, updated.getTeamMemberIds())) {
            String groupName = "TeamMember_" + projectId;
            List<UUID> newMembers = updated.getTeamMemberIds() != null
                    ? updated.getTeamMemberIds() : new ArrayList<>();
            updateGroupMembership(groupName, newMembers, accountId);
        }

        // ProjectManager group — if managerId changed
        if (!Objects.equals(oldManagerId, updated.getManagerId())) {
            String groupName = "ProjectManager_" + projectId;
            List<UUID> newMembers = updated.getManagerId() != null
                    ? List.of(updated.getManagerId()) : new ArrayList<>();
            updateGroupMembership(groupName, newMembers, accountId);
        }

        // ManagerDelegate group — if managerDelegateId changed
        if (!Objects.equals(oldDelegateId, updated.getManagerDelegateId())) {
            String groupName = "ManagerDelegate_" + projectId;
            List<UUID> newMembers = updated.getManagerDelegateId() != null
                    ? List.of(updated.getManagerDelegateId()) : new ArrayList<>();
            updateGroupMembership(groupName, newMembers, accountId);
        }
    }

    /**
     * Finds the dynamic group by name (using getOrCreateDynamicGroup) and
     * updates its membership via saveMembershipToGroup.
     */
    private void updateGroupMembership(String groupName, List<UUID> newMembers, UUID accountId) {
        try {
            IkonGroup group = IkonGroup.builder()
                    .groupName(groupName)
                    .groupType(GroupType.DYNAMIC)
                    .accountId(accountId)
                    .softwareId(applicationProperties.getSoftwareId())
                    .build();

            // getOrCreateDynamicGroup returns the existing group if found, or creates it
            IkonGroup resolvedGroup = ikonGroupService.getOrCreateDynamicGroup(group);

            if (newMembers != null && !newMembers.isEmpty()) {
                ikonGroupService.saveMembershipToGroup(
                        resolvedGroup.getGroupId(),
                        newMembers,
                        accountId);
            }
            log.info("Updated membership for group '{}' with {} member(s).",
                    groupName, newMembers != null ? newMembers.size() : 0);
        } catch (Exception ex) {
            log.error("Failed to update membership for group '{}': {}", groupName, ex.getMessage(), ex);
        }
    }

    // ── Dynamic group creation ──────────────────────────────────────────────

    /**
     * Creates TeamMember, ProjectManager, and ManagerDelegate dynamic groups
     * for a newly synced project. Mirrors the logic in ProjectServiceImpl but
     * operates without SecurityContext.
     */
    private void createDynamicGroupsForProject(Project project, UUID accountId) {
        String teamMemberGroup = "TeamMember_" + project.getId();
        String pmGroup = "ProjectManager_" + project.getId();
        String delegateGroup = "ManagerDelegate_" + project.getId();

        // Create TeamMember group
        List<UUID> teamMembers = project.getTeamMemberIds() != null
                ? project.getTeamMemberIds()
                : new ArrayList<>();
        createDynamicGroup(teamMemberGroup,
                "Dynamic group for Team Members of Project: " + project.getId(),
                teamMembers, accountId);

        // Create ProjectManager group
        List<UUID> pmMembers = project.getManagerId() != null
                ? List.of(project.getManagerId())
                : new ArrayList<>();
        createDynamicGroup(pmGroup,
                "Dynamic group for Project Manager of Project: " + project.getId(),
                pmMembers, accountId);

        // Create ManagerDelegate group
        List<UUID> delegateMembers = project.getManagerDelegateId() != null
                ? List.of(project.getManagerDelegateId())
                : new ArrayList<>();
        createDynamicGroup(delegateGroup,
                "Dynamic group for Manager Delegate of Project: " + project.getId(),
                delegateMembers, accountId);

        // Persist the dynamic/write groups on the project
        projectRepository.save(project);
    }

    private void createDynamicGroup(String groupName, String groupDesc, List<UUID> userIds, UUID accountId) {
        try {
            IkonGroup group = IkonGroup.builder()
                    .groupName(groupName)
                    .groupType(GroupType.DYNAMIC)
                    .groupDescription(groupDesc)
                    .accountId(accountId)
                    .softwareId(applicationProperties.getSoftwareId())
                    .build();

            IkonGroup createdGroup = ikonGroupService.createGroup(group);

            if (userIds != null && !userIds.isEmpty()) {
                ikonGroupService.saveMembershipToGroup(
                        createdGroup.getGroupId(),
                        userIds,
                        accountId);
            }
        } catch (Exception ex) {
            if (ex.getMessage() != null && ex.getMessage().contains("already exists")) {
                log.warn("Dynamic group already exists: {}", groupName);
            } else {
                log.error("Failed to create dynamic group '{}': {}", groupName, ex.getMessage(), ex);
            }
        }
    }

    // ── accountId resolution ────────────────────────────────────────────────

    private UUID resolveAccountIdFromConnection() {
        try {
            Optional<ConnectorConfigResponse> projectConfig = configService.getAllConnectorConfigs().stream()
                    .filter(c -> "Project".equals(c.getAvailableModule()))
                    .max(Comparator.comparing(ConnectorConfigResponse::getCreatedAt));

            if (projectConfig.isPresent()) {
                Optional<ConnectionResponse> projectConnection = connectionService.getConnections().stream()
                        .filter(conn -> conn.getConnectorConfig() != null &&
                                projectConfig.get().getId().equals(conn.getConnectorConfig().getId()))
                        .max(Comparator.comparing(ConnectionResponse::getCreatedAt));
                if (projectConnection.isPresent()) {
                    return projectConnection.get().getAccountId();
                }
            }
        } catch (Exception e) {
            log.error("Failed to resolve accountId from connection: {}", e.getMessage(), e);
        }
        return null;
    }

    // ── Parsing helpers ─────────────────────────────────────────────────────

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

    private String toStr(Object value) {
        return value != null ? String.valueOf(value) : null;
    }
}