import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { LoginRequest } from '../../models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginData: LoginRequest = {
    email: '',
    password: ''
  };

  errorMessage = '';
  isLoading = false;
  showPassword = false;
  returnUrl = '/dashboard';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) {
    // Check if there is a return URL from route query params
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  onSubmit(): void {
    this.errorMessage = '';

    // Client-side validation
    if (!this.loginData.email || !this.loginData.password) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    if (!this.isValidEmail(this.loginData.email)) {
      this.errorMessage = 'Please enter a valid email address.';
      return;
    }

    this.isLoading = true;

    this.authService.login(this.loginData).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastService.success('Welcome back! Successfully logged in.');
        this.router.navigate([this.returnUrl]);
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 401 || err.status === 400) {
          this.errorMessage = 'Invalid email or password. Please try again.';
          this.toastService.error('Invalid email or password.');
        } else if (err.status === 0) {
          this.errorMessage = 'Unable to connect to server. Please check your connection.';
          this.toastService.error('Unable to connect to server.');
        } else {
          this.errorMessage = err.error?.message || 'An unexpected error occurred. Please try again.';
          this.toastService.error('Login failed. Please try again.');
        }
      }
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
