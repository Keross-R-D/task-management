package com.ikon.taskmanagement.repository;

import com.ikon.taskmanagement.entity.MyTaskWorklog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MyTaskWorklogRepository extends JpaRepository<MyTaskWorklog, UUID> {
    List<MyTaskWorklog> findByMyTaskId(UUID myTaskId);

}