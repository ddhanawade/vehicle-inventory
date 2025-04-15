import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8082/auth'; // Backend API base URL
  private tokenKey = 'authToken';

  // BehaviorSubject to track authentication state
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.isAuthenticated());
  isLoggedIn$ = this.isLoggedInSubject.asObservable(); // Observable for components to subscribe to

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/login`, { username, password });
  }

  saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token); // Save the token in local storage
    this.isLoggedInSubject.next(true); // Notify components that the user is logged in
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey); // Retrieve the token from local storage
  }

  logout(token: string): Observable<any> {
    const headers = { Authorization: `Bearer ${token}` }; // Add the token to the Authorization header
    return this.http.post(`${this.baseUrl}/logout`, {}, { headers, responseType: 'text' as 'json' }); // Expect plain text response
  }
  clearToken(): void {
    localStorage.removeItem(this.tokenKey); // Remove the token from local storage
    this.isLoggedInSubject.next(false); // Notify components that the user is logged out
  }

  registerUser(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`,  userData); // Ensure the endpoint matches the backend
  }

  isAuthenticated(): boolean {
    return !!this.getToken(); // Check if the token exists
  }
}