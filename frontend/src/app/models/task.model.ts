export interface Task {
  id?: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  userId?: number;
  assignedToId?: number | null;
  assignedToName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export interface TaskComment {
  id?: number;
  taskId: number;
  authorId?: number;
  authorName?: string;
  body: string;
  createdAt?: string;
}

export interface ActivityLog {
  id?: number;
  taskId?: number | null;
  actorId: number;
  actorName?: string;
  actionCode: string;
  message: string;
  createdAt?: string;
}

export interface TaskSummary {
  totalTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  overdueTasks: number;
  completionRate: number;
  highPriorityTasks?: number;
  mediumPriorityTasks?: number;
  lowPriorityTasks?: number;
  statusCounts: { [key: string]: number };
  priorityCounts: { [key: string]: number };
}
