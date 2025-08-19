import { Component, OnInit, OnDestroy, HostListener, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from '../../services/AuthService';
import { interval, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { CommonModule, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-session-expired-dialog',
  imports: [CommonModule, DecimalPipe],
  templateUrl: './session-expired-dialog-component.component.html',
  styleUrls: ['./session-expired-dialog-component.component.scss']
})
export class SessionExpiredDialogComponent implements OnInit, OnDestroy {
  // Interactive properties
  countdown: number = 30; // 30 seconds countdown
  initialCountdown: number = 30;
  isCountdownActive: boolean = true;
  showRefreshOption: boolean = true;
  isRefreshing: boolean = false;
  refreshAttempts: number = 0;
  maxRefreshAttempts: number = 3;
  
  // Animation states
  isVisible: boolean = false;
  pulseAnimation: boolean = false;
  
  // Subscriptions
  private countdownSubscription?: Subscription;
  private pulseSubscription?: Subscription;

  constructor(
    private router: Router,
    private authService: AuthService,
    private dialogRef: MatDialogRef<SessionExpiredDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    // Configure dialog
    this.dialogRef.disableClose = true;
    this.dialogRef.backdropClick().subscribe(() => {
      this.shakeDialog();
    });
  }

  ngOnInit(): void {
    // Trigger entrance animation
    setTimeout(() => {
      this.isVisible = true;
    }, 100);

    // Start countdown
    this.startCountdown();
    
    // Start pulse animation for critical countdown
    this.startPulseAnimation();
    
    // Focus on dialog for keyboard accessibility
    this.focusDialog();
  }

  ngOnDestroy(): void {
    this.stopCountdown();
    this.stopPulseAnimation();
  }

  // Keyboard shortcuts
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        this.navigateToLogin();
        break;
      case 'Escape':
        event.preventDefault();
        this.shakeDialog();
        break;
      case 'r':
      case 'R':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          this.attemptRefreshSession();
        }
        break;
      case ' ':
        event.preventDefault();
        this.pauseResumeCountdown();
        break;
    }
  }

  // Countdown functionality
  startCountdown(): void {
    this.isCountdownActive = true;
    this.countdownSubscription = interval(1000).subscribe(() => {
      this.countdown--;
      
      if (this.countdown <= 0) {
        this.autoRedirectToLogin();
      }
    });
  }

  stopCountdown(): void {
    this.isCountdownActive = false;
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }
  }

  pauseResumeCountdown(): void {
    if (this.isCountdownActive) {
      this.stopCountdown();
    } else {
      this.startCountdown();
    }
  }

  resetCountdown(): void {
    this.countdown = this.initialCountdown;
    this.stopCountdown();
    this.startCountdown();
  }

  // Animation helpers
  startPulseAnimation(): void {
    this.pulseSubscription = interval(2000).subscribe(() => {
      if (this.countdown <= 10) {
        this.pulseAnimation = true;
        setTimeout(() => {
          this.pulseAnimation = false;
        }, 1000);
      }
    });
  }

  stopPulseAnimation(): void {
    if (this.pulseSubscription) {
      this.pulseSubscription.unsubscribe();
    }
  }

  shakeDialog(): void {
    const dialog = document.querySelector('.mat-dialog-container');
    if (dialog) {
      dialog.classList.add('shake-animation');
      setTimeout(() => {
        dialog.classList.remove('shake-animation');
      }, 500);
    }
  }

  // Session refresh functionality
  async attemptRefreshSession(): Promise<void> {
    if (this.refreshAttempts >= this.maxRefreshAttempts) {
      return;
    }

    this.isRefreshing = true;
    this.refreshAttempts++;

    try {
      // Simulate session refresh attempt with a delay
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate random success/failure for demo
          const success = Math.random() > 0.5;
          if (success) {
            resolve('Session refreshed successfully');
          } else {
            reject('Session refresh failed');
          }
        }, 2000);
      });
      
      // If successful, close dialog and show success message
      this.showSuccessMessage();
      setTimeout(() => {
        this.dialogRef.close({ refreshed: true });
      }, 1500);
      
    } catch (error) {
      // If refresh fails, show error and continue countdown
      this.showRefreshError();
      this.isRefreshing = false;
      
      if (this.refreshAttempts >= this.maxRefreshAttempts) {
        this.showRefreshOption = false;
      }
    }
  }

  // Navigation methods
  navigateToLogin(): void {
    this.stopCountdown();
    this.dialogRef.close({ action: 'login' });
    this.router.navigate(['/login']);
  }

  autoRedirectToLogin(): void {
    this.stopCountdown();
    this.dialogRef.close({ action: 'auto-redirect' });
    this.router.navigate(['/login']);
  }

  // Helper methods
  focusDialog(): void {
    setTimeout(() => {
      const dialog = document.querySelector('.mat-dialog-container');
      if (dialog) {
        (dialog as HTMLElement).focus();
      }
    }, 200);
  }

  showSuccessMessage(): void {
    // Add success state for UI feedback
    const successElement = document.querySelector('.refresh-success');
    if (successElement) {
      successElement.classList.add('show');
    }
  }

  showRefreshError(): void {
    // Add error state for UI feedback
    const errorElement = document.querySelector('.refresh-error');
    if (errorElement) {
      errorElement.classList.add('show');
      setTimeout(() => {
        errorElement.classList.remove('show');
      }, 3000);
    }
  }

  // Getters for template
  get countdownPercentage(): number {
    return (this.countdown / this.initialCountdown) * 100;
  }

  get isCountdownCritical(): boolean {
    return this.countdown <= 10;
  }

  get isCountdownWarning(): boolean {
    return this.countdown <= 20 && this.countdown > 10;
  }

  get canRefreshSession(): boolean {
    return this.showRefreshOption && !this.isRefreshing && this.refreshAttempts < this.maxRefreshAttempts;
  }

  get refreshButtonText(): string {
    if (this.isRefreshing) {
      return 'Refreshing...';
    }
    return `Refresh Session (${this.maxRefreshAttempts - this.refreshAttempts} left)`;
  }
}
