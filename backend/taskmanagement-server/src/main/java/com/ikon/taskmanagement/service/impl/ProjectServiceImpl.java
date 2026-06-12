package com.ikon.taskmanagement.service.impl;

import com.ikon.taskmanagement.dto.request.ProjectRequestDto;
import com.ikon.taskmanagement.dto.response.ProjectResponseDto;
import com.ikon.taskmanagement.entity.Project;
import com.ikon.taskmanagement.mapper.ProjectMapper;
import com.ikon.taskmanagement.repository.ProjectRepository;
import com.ikon.taskmanagement.service.ProjectService;
import com.ikon.webservice.WebService;
import com.ikon.app.core.properties.IkonApplicationProperties;
import com.ikon.appaccessmanagement.entity.group.IkonGroup;
import com.ikon.appaccessmanagement.enums.GroupType;
import com.ikon.appaccessmanagement.service.IkonGroupService;
import org.springframework.stereotype.Service;

import com.ikon.dac.core.AccessCriteria;
import com.ikon.dac.core.DataAccessFilter;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
public class ProjectServiceImpl extends WebService implements ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMapper projectMapper;
    private final DataAccessFilter dataAccessFilter;
    private final IkonGroupService ikonGroupService;
    private final IkonApplicationProperties applicationProperties;

    public ProjectServiceImpl(ProjectRepository projectRepository, ProjectMapper projectMapper,
            DataAccessFilter dataAccessFilter, IkonGroupService ikonGroupService,
            IkonApplicationProperties applicationProperties) {
        this.projectRepository = projectRepository;
        this.projectMapper = projectMapper;
        this.dataAccessFilter = dataAccessFilter;
        this.ikonGroupService = ikonGroupService;
        this.applicationProperties = applicationProperties;
    }

    private void dynamicGroupCreation(String groupName, String groupDesc, List<UUID> userIds) {
        try {
            IkonGroup group = IkonGroup.builder()
                    .groupName(groupName)
                    .groupType(GroupType.DYNAMIC)
                    .groupDescription(groupDesc)
                    .accountId(getActiveAccountId())
                    .softwareId(applicationProperties.getSoftwareId())
                    .build();

            IkonGroup createdGroup = ikonGroupService.createGroup(group);

            if (userIds != null && !userIds.isEmpty()) {
                ikonGroupService.saveMembershipToGroup(
                        createdGroup.getGroupId(),
                        userIds,
                        getActiveAccountId());
            }
        } catch (Exception ex) {
            if (ex.getMessage() != null && ex.getMessage().contains("already exists")) {
                log.warn("Dynamic group already exists: {}", groupName);
            } else {
                throw new RuntimeException("Failed to create dynamic group: " + groupName, ex);
            }
        }
    }

    @Override
    public ProjectResponseDto createProject(ProjectRequestDto projectDto) {
        Project project = projectMapper.mapToEntity(projectDto);
        project.setAccountId(getActiveAccountId());
        Project savedProject = projectRepository.save(project);

        String teamMemberGroup = "TeamMember_" + savedProject.getId();
        String pmGroup = "ProjectManager_" + savedProject.getId();
        String delegateGroup = "ManagerDelegate_" + savedProject.getId();

        savedProject.setDynamicGroups(new HashSet<>(Set.of(teamMemberGroup, pmGroup, delegateGroup)));
        savedProject.setWriteGroups(new HashSet<>(Set.of(pmGroup, delegateGroup)));

        List<UUID> teamMembers = savedProject.getTeamMemberIds() != null ? savedProject.getTeamMemberIds()
                : new ArrayList<>();
        dynamicGroupCreation(teamMemberGroup, "Dynamic group for Team Members of Project: " + savedProject.getId(),
                teamMembers);

        List<UUID> pmMembers = savedProject.getManagerId() != null ? List.of(savedProject.getManagerId())
                : new ArrayList<>();
        dynamicGroupCreation(pmGroup, "Dynamic group for Project Manager of Project: " + savedProject.getId(),
                pmMembers);

        List<UUID> delegateMembers = savedProject.getManagerDelegateId() != null
                ? List.of(savedProject.getManagerDelegateId())
                : new ArrayList<>();
        dynamicGroupCreation(delegateGroup, "Dynamic group for Manager Delegate of Project: " + savedProject.getId(),
                delegateMembers);

        savedProject = projectRepository.save(savedProject);
        return projectMapper.mapToDto(savedProject);
    }

    @Override
    public List<ProjectResponseDto> getAllProjects() {
        AccessCriteria criteria = AccessCriteria.builder().allowedRoles(Set.of("Task Manager"))
                .dynamicGroupsField("dynamicGroups").build();
        return dataAccessFilter.findAll(Project.class, criteria).stream()
                .map(projectMapper::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public ProjectResponseDto getProjectById(UUID id) {
        AccessCriteria criteria = AccessCriteria.builder().ownerField("managerId").allowedRoles(Set.of("Task Manager"))
                .dynamicGroupsField("dynamicGroups").build();
        Project project = dataAccessFilter.findById(Project.class, id, criteria)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));
        return projectMapper.mapToDto(project);
    }

    @Override
    public ProjectResponseDto updateProject(UUID id, ProjectRequestDto projectDto) {
        AccessCriteria criteria = AccessCriteria.builder().ownerField("managerId").allowedRoles(Set.of("Task Manager"))
                .dynamicGroupsField("dynamicGroups").build();
        Project existingProject = dataAccessFilter.findById(Project.class, id, criteria)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));

        projectMapper.updateEntityFromDto(projectDto, existingProject);

        String teamMemberGroup = "TeamMember_" + existingProject.getId();
        String pmGroup = "ProjectManager_" + existingProject.getId();
        String delegateGroup = "ManagerDelegate_" + existingProject.getId();

        boolean tmGroupExists = existingProject.getDynamicGroups() != null
                && existingProject.getDynamicGroups().contains(teamMemberGroup);
        boolean pmGroupExists = existingProject.getDynamicGroups() != null
                && existingProject.getDynamicGroups().contains(pmGroup);
        boolean delegateGroupExists = existingProject.getDynamicGroups() != null
                && existingProject.getDynamicGroups().contains(delegateGroup);

        if (existingProject.getDynamicGroups() == null) {
            existingProject.setDynamicGroups(new HashSet<>());
        }
        if (existingProject.getWriteGroups() == null) {
            existingProject.setWriteGroups(new HashSet<>());
        }

        existingProject.getDynamicGroups().add(teamMemberGroup);
        existingProject.getDynamicGroups().add(pmGroup);
        existingProject.getDynamicGroups().add(delegateGroup);

        existingProject.getWriteGroups().add(pmGroup);
        existingProject.getWriteGroups().add(delegateGroup);

        if (!tmGroupExists) {
            List<UUID> teamMembers = existingProject.getTeamMemberIds() != null ? existingProject.getTeamMemberIds()
                    : new ArrayList<>();
            dynamicGroupCreation(teamMemberGroup,
                    "Dynamic group for Team Members of Project: " + existingProject.getId(), teamMembers);
        }

        if (!pmGroupExists) {
            List<UUID> pmMembers = existingProject.getManagerId() != null ? List.of(existingProject.getManagerId())
                    : new ArrayList<>();
            dynamicGroupCreation(pmGroup, "Dynamic group for Project Manager of Project: " + existingProject.getId(),
                    pmMembers);
        }

        if (!delegateGroupExists) {
            List<UUID> delegateMembers = existingProject.getManagerDelegateId() != null
                    ? List.of(existingProject.getManagerDelegateId())
                    : new ArrayList<>();
            dynamicGroupCreation(delegateGroup,
                    "Dynamic group for Manager Delegate of Project: " + existingProject.getId(), delegateMembers);
        }

        Project updatedProject = projectRepository.save(existingProject);
        return projectMapper.mapToDto(updatedProject);
    }

    @Override
    public void deleteProject(UUID id) {
        AccessCriteria criteria = AccessCriteria.builder().ownerField("managerId").allowedRoles(Set.of("Task Manager"))
                .dynamicGroupsField("dynamicGroups").build();
        Project existingProject = dataAccessFilter.findById(Project.class, id, criteria)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));
        projectRepository.delete(existingProject);
    }
}
