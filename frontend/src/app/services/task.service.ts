import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Task, TaskSummary } from '../models/task.model';

const TASK_API = `${environment.apiUrl}/tasks`;

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor(private http: HttpClient) {}

  getAllTasks(priority?: string): Observable<Task[]> {
    let params = new HttpParams();
    if (priority) {
      params = params.set('priority', priority);
    }
    return this.http.get<Task[]>(TASK_API, { params });
  }

  getTaskById(id: number): Observable<Task> {
    return this.http.get<Task>(`${TASK_API}/${id}`);
  }

  createTask(task: Task): Observable<Task> {
    return this.http.post<Task>(TASK_API, task);
  }

  updateTask(id: number, task: Task): Observable<Task> {
    return this.http.put<Task>(`${TASK_API}/${id}`, task);
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${TASK_API}/${id}`);
  }

  getSummary(): Observable<TaskSummary> {
    return this.http.get<TaskSummary>(`${TASK_API}/summary`);
  }
}
