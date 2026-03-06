package com.taskflow.controller;

import com.taskflow.dto.ActivityLogDTO;
import com.taskflow.service.ActivityLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activity")
public class ActivityFeedController {

    @Autowired
    private ActivityLogService activityLogService;

    //   GET /api/activity
    //   F-EXT-05 TC-AF06: Returns max 20 most recent entries for current user.
     
    @GetMapping
    public ResponseEntity<List<ActivityLogDTO>> getMyFeed() {
        return ResponseEntity.ok(activityLogService.getFeedForCurrentUser());
    }

    // GET /api/activity/task/{taskId}
    //  Activity log for a specific task.
    
    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<ActivityLogDTO>> getTaskFeed(@PathVariable Long taskId) {
        return ResponseEntity.ok(activityLogService.getFeedByTask(taskId));
    }
}
