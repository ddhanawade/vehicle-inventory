import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/AuthService';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { userService } from '../../services/userService';
import { UserModel } from '../../models/UserModel';

@Component({
  selector: 'app-login',
  imports: [CommonModule ,FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent  {
  username: string = '';
  password: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  user: UserModel | null = null;

  constructor(private authService: AuthService, private userservice: userService, private router: Router, private snackBar: MatSnackBar) {}


  login() {
    if (this.username == ''|| this.password == '') {
      this.errorMessage = 'Username and password are required';
      return;
    }
  
    this.authService.login(this.username, this.password).subscribe({
      next: (response) => {
        this.authService.saveToken(response.token);
        this.successMessage = 'Login Successful.';
        this.authService.getUserByName(this.username).subscribe((user: UserModel) => {
        this.authService.setUser(user);  // Assign the resolved UserModel object
          console.log("User Details " + JSON.stringify(this.user));
        }, (error) => {
          console.error('Error fetching user:', error);
        });
        setTimeout(() => {
          this.router.navigate(['/home-page']); // Redirect to the home page
        }, 3000);
      },
      error: (err) => {
        this.errorMessage = 'Invalid username or password';
        setTimeout(() => {
          this.errorMessage = '';
          //this.router.navigate(['/']); // Redirect to a different page if needed
        }, 2000);
        console.error('Login failed:', err);
      }
    });
  }
}
