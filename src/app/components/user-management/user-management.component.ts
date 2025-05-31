import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, NgModule } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { UserModel } from '../../models/UserModel';
import { userService } from '../../services/userService';
import { AuthService } from '../../services/AuthService';

@Component({
  selector: 'app-user-management',
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class UserManagementComponent {
  showPassword = false;
  userData = {
    username: '',
    email: '',
    password: '',
    roles: [] as string[] // Initialize roles as an empty array
  };

  constructor(private userService : userService, private fb: FormBuilder, private authService : AuthService) { 
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', Validators.required],
      roles: ['', Validators.required],
      createdDate: ['', Validators.required]
    });
  }

  userForm!: FormGroup;
  userList: UserModel[] = [];
  editUserData: any = {};
  successMessage: string = '';

  onSubmit(form: any) {
    console.log('Form submitted:', form);
  }

  getUsers(){
    this.userService.getUsers().subscribe((result: UserModel[]) =>{
      this.userList = result;
    })
  }

  availableRoles = ['ADMIN', 'USER', 'TATA', 'TOYOTA', 'EICHER']; // Dynamic roles

//   onCreateUser(): void {
//     // Ensure roles are in the correct format (array of strings)
//     if (typeof this.userData.roles === 'string') {
//       this.userData.roles = [this.userData.roles]; // Convert single role to an array
//     }
  
//     console.log('User data being sent:', this.userData); // Log the user data
  
//     this.authService.registerUser(this.userData).subscribe(
//       (response:any) => {
//         console.log('Full Response from backend:', response); // Log the full response
//         this.successMessage = response; // Safely extract the message
//         console.log('Extracted successMessage:', this.successMessage); // Log the extracted message
  
//         setTimeout(() => {
//           this.successMessage = '';
//         }, 3000);
  
//         // Reset the userData object after successful submission
//         this.userData = {
//           username: '',
//           email: '',
//           password: '',
//           roles: [] as string[] // Initialize roles as an empty array
//         };
//       },
//       (error) => {
//         console.error('Error creating user:', error); // Log the error
//         this.successMessage = error.error?.message || 'An error occurred while creating the user.';
//       }
//     );
//   }
// }



onCreateUser(): void {
  // Ensure roles are in the correct format (array of strings)
  if (typeof this.userData.roles === 'string') {
    this.userData.roles = [this.userData.roles]; // Convert single role to an array
  }

  const userDataForLogging = { ...this.userData } as {
    username: string;
    email: string;
    password?: string;
    roles: string[];
  };
  
  delete userDataForLogging.password;

  // console.log('User data being sent (without password):', userDataForLogging); // Log user data without password

  this.authService.registerUser(this.userData).subscribe(
    (response: any) => {
      console.log('Full Response from backend:', response); // Log the full response
      this.successMessage = response?.message || 'User registered successfully...'; // Safely extract the message
      console.log('Extracted successMessage:', this.successMessage); // Log the extracted message

      setTimeout(() => {
        this.successMessage = '';
      }, 3000);

      // Reset the userData object after successful submission
      this.userData = {
        username: '',
        email: '',
        password: '',
        roles: [] as string[] // Initialize roles as an empty array
      };
    },
    (error) => {
      console.error('Error creating user:', error); // Log the error
      this.successMessage = error.error?.message || 'An error occurred while creating the user.';
    }
  );
}
}