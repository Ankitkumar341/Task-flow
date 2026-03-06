import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Default redirect
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // Guest-only routes (login, register)
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent),
    canActivate: [guestGuard]
  },

  // Authenticated routes
  {
    path: 'dashboard',
    loadComponent: () => import('./tasks/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'tasks/new',
    loadComponent: () => import('./tasks/task-form/task-form.component').then(m => m.TaskFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'tasks/:id/edit',
    loadComponent: () => import('./tasks/task-form/task-form.component').then(m => m.TaskFormComponent),
    canActivate: [authGuard]
  },

  // 404 Wildcard
  {
    path: '**',
    loadComponent: () => import('./shared/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];
