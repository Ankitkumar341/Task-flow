import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivityService } from '../services/activity.service';
import { ToastService } from '../services/toast.service';
import { ActivityLog } from '../models/task.model';
import { RelativeTimePipe } from '../pipes/relative-time.pipe';

@Component({
  selector: 'app-activity-feed',
  standalone: true,
  imports: [CommonModule, RelativeTimePipe],
  templateUrl: './activity-feed.component.html'
})
export class ActivityFeedComponent implements OnInit {
  activities: ActivityLog[] = [];
  isLoading = false;

  constructor(
    private activityService: ActivityService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadActivities();
  }

  loadActivities(): void {
    this.isLoading = true;
    this.activityService.getRecentActivity(20).subscribe({
      next: (data) => {
        this.activities = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.toastService.error('Failed to load activity feed.');
      }
    });
  }

  refresh(): void {
    this.loadActivities();
  }

  getActionIcon(code?: string): string {
    const map: Record<string, string> = {
      'TASK_CREATED': 'bi-plus',
      'TASK_STATUS_CHANGED': 'bi-arrow-repeat',
      'TASK_ASSIGNED': 'bi-person-fill',
      'COMMENT_ADDED': 'bi-chat-fill',
      'TASK_DELETED': 'bi-trash-fill',
      'TASK_UPDATED': 'bi-pencil-fill',
      'PRIORITY_CHANGED': 'bi-exclamation-fill'
    };
    return map[code || ''] || 'bi-activity';
  }

  getActionCircleClass(code?: string): string {
    const map: Record<string, string> = {
      'COMMENT_ADDED': 'tf-circle-blue',
      'TASK_STATUS_CHANGED': 'tf-circle-amber',
      'TASK_ASSIGNED': 'tf-circle-purple',
      'TASK_CREATED': 'tf-circle-green',
      'PRIORITY_CHANGED': 'tf-circle-red',
      'TASK_DELETED': 'tf-circle-grey',
      'TASK_UPDATED': 'tf-circle-blue'
    };
    return map[code || ''] || 'tf-circle-grey';
  }

  getActionColor(code?: string): string {
    const map: Record<string, string> = {
      'TASK_CREATED': 'text-success',
      'TASK_STATUS_CHANGED': 'text-warning',
      'TASK_ASSIGNED': 'text-info',
      'COMMENT_ADDED': 'text-primary',
      'TASK_DELETED': 'text-secondary',
      'TASK_UPDATED': 'text-primary',
      'PRIORITY_CHANGED': 'text-danger'
    };
    return map[code || ''] || 'text-muted';
  }
}
