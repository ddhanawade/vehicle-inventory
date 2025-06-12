import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/AuthService';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { userService } from '../../services/userService';
import { UserModel } from '../../models/UserModel';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  imports: [CommonModule ,FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent  {
  username: string = '';
  password: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  successEmailMessage: string = '';
  showPassword: boolean = false;
  user: UserModel | null = null;
  showEditPopup: boolean = false;
  email : string = ''

  constructor(private authService: AuthService, private userservice: userService, private router: Router, private snackBar: MatSnackBar) {}

  showPopup(): void {
      this.showEditPopup = true;
    }

  closeEditPopup(): void {
    this.showEditPopup = false;
  }

  onReset(): void{
    this.authService.resetPassword(this.email).subscribe({
      next: (response) => {
        this.successEmailMessage = "Email reset link shared on email...";
        setTimeout(() => {
          this.successMessage = '';
          this.closePopup();
        }, 3000);
        this.router.navigate(['/']); // Redirect to a different page if needed
      },
      error: (err) => {
        this.errorMessage = 'Email not exist...';
        setTimeout(() => {
          this.errorMessage = '';
          //this.router.navigate(['/']); // Redirect to a different page if needed
        }, 2000);
        console.error('Login failed:', err);
      }
    })
  }

  closePopup(): void {
    this.showEditPopup = false;
  }

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
