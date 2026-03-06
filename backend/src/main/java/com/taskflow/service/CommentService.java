package com.taskflow.service;

import com.taskflow.dto.CommentDTO;
import com.taskflow.exception.ForbiddenException;
import com.taskflow.exception.ResourceNotFoundException;
import com.taskflow.model.Task;
import com.taskflow.model.TaskComment;
import com.taskflow.model.User;
import com.taskflow.repository.TaskCommentRepository;
import com.taskflow.repository.TaskRepository;
import com.taskflow.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommentService {

    @Autowired
    private TaskCommentRepository commentRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ActivityLogService activityLogService;

    // Get all comments for a task (chronological order).

    public List<CommentDTO> getCommentsByTaskId(Long taskId) {
        // Verify task exists
        taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));

        return commentRepository.findByTaskIdOrderByCreatedAtAsc(taskId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

     //Post a new comment on a task.
     //TC-C01: Returns 201 with author + timestamp.(TC-C01 Means Which Features are Expand in second phase of project)
     
    @Transactional
    public CommentDTO addComment(Long taskId, String body) {
        User currentUser = getCurrentUser();
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));

        TaskComment comment = TaskComment.builder()
                .task(task)
                .author(currentUser)
                .body(body.trim())
                .build();

        TaskComment saved = commentRepository.save(comment);

        // Log activity
        activityLogService.log(task, currentUser,
                ActivityLogService.COMMENT_ADDED,
                currentUser.getUsername() + " commented on \"" + task.getTitle() + "\"");

        return toDTO(saved);
    }

  
    // TC-C01 Means Which Features are Expand in second phase of project
     //TC-C03: Only the author can delete their own comment.
     // TC-C04: Others get 403 Forbidden.

    @Transactional
    public void deleteComment(Long commentId) {
        TaskComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));

        User currentUser = getCurrentUser();

        if (!comment.getAuthor().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("You can only delete your own comments");
        }

        Task task = comment.getTask();
        commentRepository.delete(comment);

        // Log activity
        activityLogService.log(task, currentUser,
                ActivityLogService.COMMENT_DELETED,
                currentUser.getUsername() + " deleted a comment on \"" + task.getTitle() + "\"");
    }


    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private CommentDTO toDTO(TaskComment comment) {
        return CommentDTO.builder()
                .id(comment.getId())
                .taskId(comment.getTask().getId())
                .authorId(comment.getAuthor().getId())
                .authorName(comment.getAuthor().getUsername())
                .body(comment.getBody())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
