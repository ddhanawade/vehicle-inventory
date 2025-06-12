import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/AuthService';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit {
login() {
throw new Error('Method not implemented.');
}
showPopup() {
throw new Error('Method not implemented.');
}
closeEditPopup() {
throw new Error('Method not implemented.');
}
onReset() {
throw new Error('Method not implemented.');
}
  resetPasswordForm!: FormGroup;
  token!: string;
successMessage: any;
errorMessage: any;
username: any;
password: any;
showPassword: any;
showEditPopup: any;
email: any;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get the token from the URL
    this.token = this.route.snapshot.queryParamMap.get('token') || '';

    // Initialize the form
    this.resetPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    });
  }

  passwordsMatchValidator(formGroup: FormGroup): { [key: string]: boolean } | null {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordsMismatch: true };
  }

  onSubmit(): void {
    if (this.resetPasswordForm.valid) {
      const { password, confirmPassword } = this.resetPasswordForm.value;
      if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
      }

      // Call the backend API to reset the password
      this.authService.forgotPassword(this.token, password).subscribe({
        next: () => {
          alert('Password reset successful!');
          this.router.navigate(['/login']); // Redirect to login page
        },
        error: (err: any) => {
          console.error(err);
          alert('Failed to reset password.');
        },
      });
    }
  }
}
