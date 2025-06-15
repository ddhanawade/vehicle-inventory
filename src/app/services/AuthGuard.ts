import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './AuthService';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const publicRoutes = ['/reset-password']; // Add public routes here
    const baseUrl = state.url.split('?')[0]; // Extract the base path without query parameters

    if (publicRoutes.includes(baseUrl)) {
     
      return true; // Allow access to public routes
    }

    const token = this.authService.getToken();
    if (token) {
      return true; // Allow access if the token exists
    } else {
      this.router.navigate(['/login-page']); // Redirect to login if not authenticated
      return false;
    }
  }
}