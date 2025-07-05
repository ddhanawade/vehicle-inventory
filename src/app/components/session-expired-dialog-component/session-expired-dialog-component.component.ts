import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-session-expired-dialog',
  imports:[],
  templateUrl: './session-expired-dialog-component.component.html',
  styleUrls: ['./session-expired-dialog-component.component.scss']
})
export class SessionExpiredDialogComponent {

  constructor(private router: Router) {}

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}
