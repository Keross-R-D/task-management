package com.ikon.taskmanagement.repository;

import com.ikon.taskmanagement.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Repository
public interface TaskRepository extends JpaRepository<Task, UUID> {
    List<Task> findByProjectId(UUID projectId);
    List<Task> findByEpicId(UUID epicId);
    List<Task> findBySprintId(UUID sprintId);
    List<Task> findByProjectIdAndSprintIdIsNull(UUID projectId);
     boolean existsByTitleIgnoreCaseAndSprintId(String title, UUID sprintId);
     List<Task> findBySprintIdIn(Set<UUID> relevantSprintIds);
}
