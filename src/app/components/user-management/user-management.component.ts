import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, NgModule, OnInit } from '@angular/core';
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
export class UserManagementComponent implements OnInit {
  showPassword = false;
  userData = {
    username: '',
    email: '',
    password: '',
    roles: [] as string[] // Initialize roles as an empty array
  };

  // Enhanced UI properties
  focusedField: string = '';
  isCreatingUser: boolean = false;
  rolesDropdownOpen: boolean = false;
  roleSearchTerm: string = '';
  filteredRoles: string[] = [];

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

  ngOnInit() {
    this.getUsers();
    this.filteredRoles = [...this.availableRoles];
  }

  // Enhanced UI methods
  getTotalUsers(): number {
    return this.userList.length;
  }

  getActiveUsers(): number {
    // Assuming active users are all users for now
    return this.userList.length;
  }

  getFormProgress(): number {
    let filledFields = 0;
    const totalFields = 4;

    if (this.userData.username) filledFields++;
    if (this.userData.email) filledFields++;
    if (this.userData.password) filledFields++;
    if (this.userData.roles && this.userData.roles.length > 0) filledFields++;

    return Math.round((filledFields / totalFields) * 100);
  }

  onFieldFocus(fieldName: string): void {
    this.focusedField = fieldName;
  }

  onFieldBlur(fieldName: string): void {
    this.focusedField = '';
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  getPasswordStrength(): string {
    const password = this.userData.password;
    if (!password) return 'weak';
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

    if (score < 2) return 'weak';
    if (score < 4) return 'medium';
    return 'strong';
  }

  getPasswordStrengthPercentage(): number {
    const strength = this.getPasswordStrength();
    switch (strength) {
      case 'weak': return 25;
      case 'medium': return 65;
      case 'strong': return 100;
      default: return 0;
    }
  }

  getPasswordStrengthText(): string {
    const strength = this.getPasswordStrength();
    switch (strength) {
      case 'weak': return 'Weak Password';
      case 'medium': return 'Medium Strength';
      case 'strong': return 'Strong Password';
      default: return '';
    }
  }

  toggleRolesDropdown(): void {
    this.rolesDropdownOpen = !this.rolesDropdownOpen;
  }

  filterRoles(): void {
    if (!this.roleSearchTerm) {
      this.filteredRoles = [...this.availableRoles];
    } else {
      this.filteredRoles = this.availableRoles.filter(role =>
        role.toLowerCase().includes(this.roleSearchTerm.toLowerCase())
      );
    }
  }

  getFilteredRoles(): string[] {
    return this.filteredRoles;
  }

  isRoleSelected(role: string): boolean {
    return this.userData.roles.includes(role);
  }

  toggleRole(role: string): void {
    const index = this.userData.roles.indexOf(role);
    if (index > -1) {
      this.userData.roles.splice(index, 1);
    } else {
      this.userData.roles.push(role);
    }
  }

  removeRole(index: number): void {
    this.userData.roles.splice(index, 1);
  }

  resetForm(form: any): void {
    this.userData = {
      username: '',
      email: '',
      password: '',
      roles: []
    };
    form.resetForm();
    this.focusedField = '';
  }

  clearSuccessMessage(): void {
    this.successMessage = '';
  }

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
  this.isCreatingUser = true;
  
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

  this.authService.registerUser(this.userData).subscribe(
    (response: any) => {
      console.log('Full Response from backend:', response);
      this.successMessage = response?.message || 'User created successfully!';
      this.isCreatingUser = false;

      setTimeout(() => {
        this.successMessage = '';
      }, 5000);

      // Reset the userData object after successful submission
      this.userData = {
        username: '',
        email: '',
        password: '',
        roles: [] as string[]
      };
      
      // Refresh user list
      this.getUsers();
    },
    (error: { error: { message: string; }; }) => {
      console.error('Error creating user:', error);
      this.successMessage = error.error?.message || 'An error occurred while creating the user.';
      this.isCreatingUser = false;
    }
  );
}
}