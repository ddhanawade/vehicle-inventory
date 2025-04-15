import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/AuthService';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  login(): void {
    if (!this.username || !this.password) {
      this.errorMessage = 'Username and password are required';
      return;
    }
  
    this.authService.login(this.username, this.password).subscribe({
      next: (response) => {
        this.authService.saveToken(response.token);
        this.router.navigate(['/home-page']); // Redirect to the dashboard
      },
      error: (err) => {
        this.errorMessage = 'Invalid username or password';
        console.error('Login failed:', err);
      }
    });
  }
}
