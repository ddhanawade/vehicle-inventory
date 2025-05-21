import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private allowBack = false;

  constructor(
    private router: Router,
    private location: Location
  ) {}

  setAllowBack(allow: boolean): void {
    this.allowBack = allow;
  }

  back(): void {
    if (this.allowBack) {
      this.location.back();
    } else {
      this.router.navigate(['/home']); // Navigate to default route
    }
  }
}