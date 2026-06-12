package com.ikon.taskmanagement.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.ikon.taskmanagement.enums.SprintStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "sprints")
@Data
@EntityListeners(AuditingEntityListener.class)
public class Sprint {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID projectId;

    @Column(nullable = false)
    private UUID epicId;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String goal;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column
    private SprintStatus status = SprintStatus.PLANNED;

    @ElementCollection
    @CollectionTable(name = "sprint_read_groups", joinColumns = @JoinColumn(name = "sprint_id"))
    @Column(name = "group_name")
    private Set<String> readGroups;

    @ElementCollection
    @CollectionTable(name = "sprint_write_groups", joinColumns = @JoinColumn(name = "sprint_id"))
    @Column(name = "group_name")
    private Set<String> writeGroups;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
