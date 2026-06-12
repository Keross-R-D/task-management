package com.ikon.taskmanagement.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.ikon.taskmanagement.enums.EpicStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "epics")
@Data
@EntityListeners(AuditingEntityListener.class)
public class Epic {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID projectId;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column
    private EpicStatus status = EpicStatus.PLANNED;

    @Column
    private LocalDate startDate;

    @Column
    private LocalDate endDate;

    @ElementCollection
    @CollectionTable(name = "epic_read_groups", joinColumns = @JoinColumn(name = "epic_id"))
    @Column(name = "group_name")
    private Set<String> readGroups;

    @ElementCollection
    @CollectionTable(name = "epic_write_groups", joinColumns = @JoinColumn(name = "epic_id"))
    @Column(name = "group_name")
    private Set<String> writeGroups;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
