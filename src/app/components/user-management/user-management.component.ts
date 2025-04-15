import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { UserModel } from '../../models/UserModel';
import { userService } from '../../services/userService';
import { AuthService } from '../../services/AuthService';

@Component({
  selector: 'app-user-management',
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})
export class UserManagementComponent {

  userData = {
    username: '',
    email: '',
    password: '',
    role: ''
  };

  constructor(private userService : userService, private fb: FormBuilder, private authService : AuthService) { 
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', Validators.required],
      role: ['', Validators.required],
      createdDate: ['', Validators.required]
    });
  }

  userForm!: FormGroup;
  userList: UserModel[] = [];
  editUserData: any = {};
  successMessage: string = '';
  stname = 'DD';

  onSubmit(form: any) {
    console.log('Form submitted:', form);
  }

  getUsers(){
    this.userService.getUsers().subscribe((result: UserModel[]) =>{
      this.userList = result;
    })
  }

  onCreateUser(): void {
    console.log('User data being sent:', this.userData); // Log the user data
  
    this.authService.registerUser(this.userData).subscribe(
      (response) => {
        console.log('Response from backend:', response); // Log the backend response
        this.successMessage = 'User created successfully!';
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
  
        // Reset the userData object after successful submission
        this.userData = {
          username: '',
          email: '',
          password: '',
          role: ''
        };
      },
      (error) => {
        console.error('Error creating user:', error); // Log the error
      }
    );
  }
  
}
