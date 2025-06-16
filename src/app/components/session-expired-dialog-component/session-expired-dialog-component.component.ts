import { Component } from '@angular/core';

@Component({
  selector: 'app-session-expired-dialog',
  template: `
    <h1 mat-dialog-title>Session Expired</h1>
    <div mat-dialog-content>
      <p>Your session has expired. Please log in again.</p>
    </div>
    <div mat-dialog-actions>
      <button mat-button mat-dialog-close>OK</button>
    </div>
  `
})
export class SessionExpiredDialogComponent {}