import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { UserModel } from '../models/UserModel';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8082/auth';
  private tokenKey = 'authToken';
  private userKey = 'authUser';

  private userSubject = new BehaviorSubject<UserModel | null>(this.getStoredUser());
  user$ = this.userSubject.asObservable(); // Observable for components to subscribe to

  private isLoggedInSubject = new BehaviorSubject<boolean>(this.isAuthenticated());
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/login`, { username, password });
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

  logout(token: string): Observable<any> {
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.post(`${this.baseUrl}/logout`, {}, { headers, responseType: 'text' as 'json' });
  }

  clearToken(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.isLoggedInSubject.next(false);
    this.userSubject.next(null);
  }

  registerUser(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, userData, { responseType: 'text' });
  }

  getUserByName(username: string): Observable<UserModel> {
    return this.http.get<UserModel>(`${this.baseUrl}/${username}`);
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
}