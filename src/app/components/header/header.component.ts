import { Component, HostListener, NgModule, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/AuthService';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  isLoggedIn: boolean = false; // Track login state
  isNavCollapsed: boolean = true; // Track navigation collapse state

  // Auto collapse based on screen size
  private readonly COLLAPSE_SIZE = 768; // You can adjust this value if needed

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.updateNavCollapse(window.innerWidth);
  }
  
  ngOnInit(): void {
    this.updateNavCollapse(window.innerWidth); // Ensure collapse state is set on initial load
    // Subscribe to the authentication state
    this.authService.isLoggedIn$.subscribe((loggedIn) => {
      this.isLoggedIn = loggedIn;
    });
  }

  updateNavCollapse(width: number) {
    this.isNavCollapsed = width <= this.COLLAPSE_SIZE;
  }
  toggleNav() {
    this.isNavCollapsed = !this.isNavCollapsed; // Toggle the nav bar visibility
  }

  constructor(private authService: AuthService, private router: Router, private snackBar: MatSnackBar) {}

  logout(): void {
    const token = this.authService.getToken();
    if (!token) {
      console.warn('No token found. Redirecting to login.');
      this.router.navigate(['/login-page']);
      return;
    }
  
    this.authService.logout(token).subscribe({
      next: () => {
        this.authService.clearToken(); // Clear the token
        this.snackBar.open('Logout successful!', 'Close', { duration: 3000 });
        this.router.navigate(['/login-page']); // Redirect to the login page
      },
      error: (err) => {
        console.error('Logout failed:', err);
        if (err.status === 403) {
          //alert('Session expired or token invalid. Please log in again.');
          this.snackBar.open('Session expired or token invalid. Please log in again.', 'Close', { duration: 3000 });
          this.authService.clearToken(); // Clear the token
          this.router.navigate(['/login-page']); // Redirect to the login page
        }
      }
    });
  }
}

