package com.ikon.taskmanagement.repository;

import com.ikon.taskmanagement.entity.TaskWorklog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TaskWorklogRepository extends JpaRepository<TaskWorklog, UUID> {
    List<TaskWorklog> findByTaskId(UUID taskId);
}
