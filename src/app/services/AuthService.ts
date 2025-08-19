import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { UserModel } from '../models/UserModel';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { SessionExpiredDialogComponent } from '../components/session-expired-dialog-component/session-expired-dialog-component.component';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'https://fleet-manager.in/auth';
  // private baseUrl = 'http://localhost:8081/auth';
  private tokenKey = 'authToken';
  private userKey = 'authUser';
  private sessionTimeout: any;

  private userSubject = new BehaviorSubject<UserModel | null>(this.getStoredUser());
  user$ = this.userSubject.asObservable();

  private isLoggedInSubject = new BehaviorSubject<boolean>(this.isAuthenticated());
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient, private router: Router, private dialog: MatDialog) {}

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/login`, { username, password }).pipe(
      tap(response => {
        if (response.token) {
          this.saveToken(response.token);
          this.startSessionTimer(response.token);
        } else {
          console.error('Token not found in login response');
        }
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }

  saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    this.isLoggedInSubject.next(true);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  startSessionTimer(token: string): void {
    const tokenPayload = JSON.parse(atob(token.split('.')[1])); // Decode JWT payload
    const expiryTime = tokenPayload.exp * 1000; // Convert expiry to milliseconds
    const currentTime = Date.now();
    const timeout = expiryTime - currentTime;

    if (timeout > 0) {
      this.sessionTimeout = setTimeout(() => {
        this.handleSessionExpiry();
      }, timeout);
    }
  }

  handleSessionExpiry(): void {
  this.clearToken();
  const dialogRef = this.dialog.open(SessionExpiredDialogComponent, {
    width: '300px',
    disableClose: true
  });

  dialogRef.afterClosed().subscribe(() => {
    this.router.navigate(['/login']);
  });
}

  clearToken(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    sessionStorage.removeItem(this.userKey); // Remove token from sessionStorage (if used)
    document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'; // Clear token from cookies
    this.isLoggedInSubject.next(false);
    this.userSubject.next(null);
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
    }
  }

  logout(): Observable<any> {
    const token = this.getToken();
    if (!token) {
      console.error('No token found for logout');
      return new Observable(observer => {
        observer.complete();
      });
    }

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.post(`${this.baseUrl}/logout`, {}, { headers, responseType: 'text' as 'json' }).pipe(
      tap(() => {
        this.clearToken();
      }),
      catchError(error => {
        console.error('Logout error:', error);
        return throwError(() => error);
      })
    );
  }

  registerUser(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, userData, { responseType: 'text' }).pipe(
      catchError(error => {
        console.error('Registration error:', error);
        return throwError(() => error);
      })
    );
  }

  forgotPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/reset-password`, { token, newPassword });
  }

  resetPassword(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/forget-password`, {email});
  }

  getUserByName(username: string): Observable<UserModel> {
    const url = `${this.baseUrl}/${username}`;
    return this.http.get<UserModel>(url); // No headers added here
  }


  setUser(user: UserModel): void {
    this.saveUser(user);
  }

  getUser(): Observable<UserModel | null> {
    return this.user$;
  }

  clearUser(): void {
    this.clearToken();
  }

  saveUser(user: UserModel): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.userSubject.next(user);
  }

  getStoredUser(): UserModel | null {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  simulateSessionExpiry(): void {
  this.handleSessionExpiry();
}

checkTokenExpiry(): void {
  const token = this.getToken();
  if (token) {
    const tokenPayload = JSON.parse(atob(token.split('.')[1])); // Decode JWT payload
    const expiryTime = tokenPayload.exp * 1000; // Convert expiry to milliseconds
    const currentTime = Date.now();

    if (currentTime >= expiryTime) {
      this.handleSessionExpiry();
    }
  }
}
}
