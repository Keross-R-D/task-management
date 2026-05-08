package com.ikon.taskmanagement.entity;

import jakarta.persistence.*;
import lombok.Data;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "mytasks")
@Data
@EntityListeners(AuditingEntityListener.class)
public class MyTask {

    @Id
    @GeneratedValue
    @JdbcTypeCode(SqlTypes.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(nullable = false)
    private String taskTitle;

    @Column(columnDefinition = "TEXT")
    private String taskDescription;

    @Column
    private String taskType;

    @Column
    private String taskPriority;

    @Column
    private String taskStatus;

    @Column
    private Double estimatedHours = 0.0;

    @Column
    @JdbcTypeCode(SqlTypes.UUID)
    private UUID assigneeId;

    @Column
    private Double actualHours = 0.0;

    @Column
    private String type = "Task";

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}