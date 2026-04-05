import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { RegisterRequest } from '../../models/user.model';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerData = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'DEVELOPER'
  };

  errorMessage = '';
  successMessage = '';
  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {}

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    // Validate all fields are filled
    if (!this.registerData.username || !this.registerData.email ||
        !this.registerData.password || !this.registerData.confirmPassword) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    if (!this.isValidEmail(this.registerData.email)) {
      this.errorMessage = 'Please enter a valid email address.';
      return;
    }

    if (this.registerData.password.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters long.';
      return;
    }

    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.errorMessage = 'Password and Confirm Password must match.';
      return;
    }

    this.isLoading = true;

    // 1. CHECK DB FIRST (Pre-check)
    forkJoin({
      emailExists: this.authService.checkEmailExists(this.registerData.email).pipe(catchError(() => of({ exists: false }))),
      usernameExists: this.authService.checkUsernameExists(this.registerData.username).pipe(catchError(() => of({ exists: false })))
    }).subscribe({
      next: (results) => {
        if (results.emailExists.exists) {
          this.isLoading = false;
          this.errorMessage = 'An account with this email already exists.';
          this.toastService.error(this.errorMessage);
          return;
        }
        if (results.usernameExists.exists) {
          this.isLoading = false;
          this.errorMessage = 'Username is already taken.';
          this.toastService.error(this.errorMessage);
          return;
        }

        // 2. ONLY IF NOT EXISTS, PROCEED TO REGISTER
        const request: RegisterRequest = {
          username: this.registerData.username,
          email: this.registerData.email,
          password: this.registerData.password,
          role: this.registerData.role
        };

        this.authService.register(request).subscribe({
          next: () => {
            this.isLoading = false;
            this.toastService.success('Account created! Please verify your email via the link sent.');
            this.router.navigate(['/verify-email'], { state: { email: request.email } });
          },
          error: (err) => {
            this.isLoading = false;
            this.errorMessage = err.error?.message || 'Registration failed. Please try again.';
            this.toastService.error(this.errorMessage);
          }
        });
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Server error during validation. Please try again later.';
        this.toastService.error(this.errorMessage);
      }
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  getPasswordStrength(): number {
    const password = this.registerData.password;
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  }
}
