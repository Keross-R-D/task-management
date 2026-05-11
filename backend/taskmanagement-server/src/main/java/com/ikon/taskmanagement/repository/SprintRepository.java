package com.ikon.taskmanagement.repository;

import com.ikon.taskmanagement.entity.Sprint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SprintRepository extends JpaRepository<Sprint, UUID> {
    List<Sprint> findByEpicId(UUID epicId);
    List<Sprint> findByProjectId(UUID projectId);
    Optional<Sprint> findByNameIgnoreCaseAndEpicId(String name, UUID epicId);
}
