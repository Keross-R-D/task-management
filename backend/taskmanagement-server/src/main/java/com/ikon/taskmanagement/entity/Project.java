package com.ikon.taskmanagement.entity;

import jakarta.persistence.*;
import lombok.Data;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.ikon.taskmanagement.enums.ProjectStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "projects")
@Data
@EntityListeners(AuditingEntityListener.class)
public class Project {

    @Id
    // @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(nullable = false)
    private String projectName;

    @Column
    private String clientName;

    @Column
    @JdbcTypeCode(SqlTypes.UUID)
    private UUID accountId;

    @Column
    @JdbcTypeCode(SqlTypes.UUID)
    private UUID managerId;

    @Column
    @JdbcTypeCode(SqlTypes.UUID)
    private UUID managerDelegateId;

    @Column
    private LocalDate startDate;

    @Column
    private LocalDate endDate;

    // @Enumerated(EnumType.STRING)
    @Column
    private String projectStatus = ProjectStatus.PLANNED.name();

    @Column
    private String type = "Project";

    @ElementCollection
    @CollectionTable(name = "project_team_members", joinColumns = @JoinColumn(name = "project_id"))
    @Column(name = "team_member_id")
    @JdbcTypeCode(SqlTypes.UUID)
    private List<UUID> teamMemberIds;

    @ElementCollection
    @CollectionTable(name = "project_dynamic_groups", joinColumns = @JoinColumn(name = "project_id"))
    @Column(name = "group_name")
    private Set<String> dynamicGroups;

    @ElementCollection
    @CollectionTable(name = "project_write_groups", joinColumns = @JoinColumn(name = "project_id"))
    @Column(name = "group_name")
    private Set<String> writeGroups;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
