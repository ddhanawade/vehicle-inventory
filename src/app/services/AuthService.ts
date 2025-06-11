import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { UserModel } from '../models/UserModel';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8082/auth';
  private tokenKey = 'authToken';
  private userKey = 'authUser';

  private userSubject = new BehaviorSubject<UserModel | null>(this.getStoredUser());
  user$ = this.userSubject.asObservable();

  private isLoggedInSubject = new BehaviorSubject<boolean>(this.isAuthenticated());
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/login`, { username, password }).pipe(
      tap(response => {
        if (response.token) {
          this.saveToken(response.token);
          console.log('JWT token stored in localStorage:', response.token);
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

  saveUser(user: UserModel): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.userSubject.next(user);
  }

  getStoredUser(): UserModel | null {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
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

  clearToken(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.isLoggedInSubject.next(false);
    this.userSubject.next(null);
  }

  registerUser(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, userData, { responseType: 'text' }).pipe(
      catchError(error => {
        console.error('Registration error:', error);
        return throwError(() => error);
      })
    );
  }

  getUserByName(username: string): Observable<UserModel> {
    const url = `${this.baseUrl}/${username}`;
    return this.http.get<UserModel>(url); // No headers added here
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
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

  resetPassword(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/forget-password`, {email}).pipe(
      tap(response => {
        if (response) {
          console.log('Email retrieved successfully:');
        } else {
          console.error('Email not found');
        }
      }),
      catchError(error => {
        console.error('error occured while email search:', error);
        return throwError(() => error);
      })
    );
  }

  forgotPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/reset-password`, { token, newPassword });
  }
}