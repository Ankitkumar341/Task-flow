import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ToastService, Toast } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tf-toast-container">
      <div *ngFor="let toast of toasts; trackBy: trackById"
           class="tf-toast"
           [class.tf-toast-success]="toast.type === 'success'"
           [class.tf-toast-error]="toast.type === 'error'"
           [class.tf-toast-info]="toast.type === 'info'"
           [class.tf-toast-warning]="toast.type === 'warning'"
           [class.tf-toast-removing]="toast.removing"
           (click)="dismiss(toast.id)">
        <i class="bi" [ngClass]="toast.icon"></i>
        <span class="tf-toast-msg">{{ toast.message }}</span>
        <button class="tf-toast-close" (click)="dismiss(toast.id); $event.stopPropagation()">
          <i class="bi bi-x"></i>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .tf-toast-container {
      position: fixed;
      top: 70px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 400px;
      pointer-events: none;
    }
    .tf-toast {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      border-radius: 12px;
      font-size: 0.875rem;
      font-weight: 500;
      box-shadow: 0 8px 30px rgba(0,0,0,0.15);
      backdrop-filter: blur(10px);
      pointer-events: all;
      cursor: pointer;
      animation: tf-toast-in 0.35s cubic-bezier(0.21, 1.02, 0.73, 1) forwards;
      border: 1px solid transparent;
    }
    .tf-toast-removing {
      animation: tf-toast-out 0.3s cubic-bezier(0.06, 0.71, 0.55, 1) forwards;
    }
    .tf-toast i:first-child {
      font-size: 1.1rem;
      flex-shrink: 0;
    }
    .tf-toast-msg {
      flex: 1;
      line-height: 1.3;
    }
    .tf-toast-close {
      background: none;
      border: none;
      padding: 0;
      margin-left: 4px;
      opacity: 0.6;
      cursor: pointer;
      font-size: 1rem;
      color: inherit;
      line-height: 1;
    }
    .tf-toast-close:hover { opacity: 1; }
    .tf-toast-success {
      background: linear-gradient(135deg, #059669, #10B981);
      color: #fff;
      border-color: rgba(255,255,255,0.15);
    }
    .tf-toast-error {
      background: linear-gradient(135deg, #DC2626, #EF4444);
      color: #fff;
      border-color: rgba(255,255,255,0.15);
    }
    .tf-toast-info {
      background: linear-gradient(135deg, #2563EB, #3B82F6);
      color: #fff;
      border-color: rgba(255,255,255,0.15);
    }
    .tf-toast-warning {
      background: linear-gradient(135deg, #D97706, #F59E0B);
      color: #fff;
      border-color: rgba(255,255,255,0.15);
    }
    @keyframes tf-toast-in {
      from {
        opacity: 0;
        transform: translateX(100%) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateX(0) scale(1);
      }
    }
    @keyframes tf-toast-out {
      from {
        opacity: 1;
        transform: translateX(0) scale(1);
      }
      to {
        opacity: 0;
        transform: translateX(100%) scale(0.95);
      }
    }
  `]
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private sub!: Subscription;

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.sub = this.toastService.toasts$.subscribe(t => this.toasts = t);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  dismiss(id: number): void {
    this.toastService.dismiss(id);
  }

  trackById(_: number, toast: Toast): number {
    return toast.id;
  }
}
