package com.ikon.taskmanagement.repository;

import com.ikon.taskmanagement.entity.MyTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MyTaskRepository extends JpaRepository<MyTask, Long> {
}

