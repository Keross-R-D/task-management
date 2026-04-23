package com.ikon.taskmanagement.repository;

import com.ikon.taskmanagement.entity.TaskWorklog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface TaskWorklogRepository extends JpaRepository<TaskWorklog, UUID> {
     List<TaskWorklog> findByTaskId(UUID taskId);

     List<TaskWorklog> findByTeamMemberId(UUID teamMemberId);

     @Query(value = """
               SELECT COALESCE(SUM(value::numeric), 0)
               FROM task_worklogs,
                    jsonb_each_text(hours_distribution) AS elem(key, value)
               WHERE task_id = :taskId
               AND team_member_id = :teamMemberId
               AND key::date BETWEEN :startDate AND :endDate
               """, nativeQuery = true)
     Double getTotalHoursBetweenDates(
               @Param("taskId") UUID taskId,
               @Param("teamMemberId") UUID teamMemberId,
               @Param("startDate") LocalDate startDate,
               @Param("endDate") LocalDate endDate);

     @Query(value = """
               SELECT team_member_id,
                      work_date,
                      COALESCE(SUM(value::numeric), 0) AS hours
               FROM task_worklogs,
                    jsonb_each_text(hours_distribution) AS elem(work_date, value)
               WHERE (:projectId IS NULL OR project_id = :projectId)
                 AND (
                       :teamMemberIds IS NULL
                       OR team_member_id IN (:teamMemberIds)
                     )
                 AND work_date::date BETWEEN :startDate AND :endDate
               GROUP BY team_member_id, work_date
               ORDER BY team_member_id, work_date
               """, nativeQuery = true)
     List<Object[]> getWeeklyTimesheetDataWithFilters(
               @Param("projectId") UUID projectId,
               @Param("teamMemberIds") List<UUID> teamMemberIds,
               @Param("startDate") LocalDate startDate,
               @Param("endDate") LocalDate endDate);
}
