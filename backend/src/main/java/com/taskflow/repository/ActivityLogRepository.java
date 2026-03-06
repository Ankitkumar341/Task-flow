package com.taskflow.repository;

import com.taskflow.model.ActivityLog;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    List<ActivityLog> findByActorIdOrderByCreatedAtDesc(Long actorId, Pageable pageable);

    List<ActivityLog> findByTaskIdOrderByCreatedAtDesc(Long taskId);

    void deleteByTaskId(Long taskId);
}
