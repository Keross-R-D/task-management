package com.ikon.taskmanagement.repository;

import com.ikon.taskmanagement.entity.Epic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EpicRepository extends JpaRepository<Epic, UUID> {
    List<Epic> findByProjectId(UUID projectId);
    Optional<Epic> findByNameIgnoreCaseAndProjectId(String name, UUID projectId);
}
