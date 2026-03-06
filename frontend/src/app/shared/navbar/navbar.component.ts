import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  currentUser: User | null = null;
  isMenuOpen = false;
  isUserDropdownOpen = false;
  isDarkMode = false;
  private subs: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.subs.push(
      this.authService.isLoggedIn$.subscribe(
        (loggedIn) => (this.isLoggedIn = loggedIn)
      )
    );
    this.subs.push(
      this.authService.currentUser$.subscribe(
        (user) => (this.currentUser = user)
      )
    );

    // Initialize dark mode from localStorage
    const saved = localStorage.getItem('tf-dark-mode');
    this.isDarkMode = saved === 'true';
    this.applyDarkMode();
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  toggleUserDropdown(): void {
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
  }

  closeDropdowns(): void {
    this.isUserDropdownOpen = false;
    this.isMenuOpen = false;
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('tf-dark-mode', String(this.isDarkMode));
    this.applyDarkMode();
  }

  private applyDarkMode(): void {
    document.documentElement.setAttribute('data-theme', this.isDarkMode ? 'dark' : 'light');
  }

  logout(): void {
    this.authService.logout();
    this.toastService.success('Successfully logged out. See you soon!');
    this.closeMenu();
  }
}
