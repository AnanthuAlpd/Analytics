import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppSettings } from '../app.settings';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient, private appSettings: AppSettings) { }

  // ... [Existing Registration & Login Methods] ...

  register(userData: any): Observable<any> {
    const url = `${this.appSettings.settings.baseUrl}/add_employee`;
    return this.http.post(url, userData);
  }

  registerClient(userData: any): Observable<any> {
    const url = `${this.appSettings.settings.baseUrl}/add_client`;
    return this.http.post(url, userData);
  }

  login(loginData: any): Observable<any> {
    const url = `${this.appSettings.settings.baseUrl}/login_new`;
    return this.http.post(url, loginData);
  }

  // ... [Existing User Getter Methods] ...

  getLoggedInUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  getUserName(): string {
    return this.getLoggedInUser()?.name || 'Guest User';
  }

  getDepartment(): string {
    return this.getLoggedInUser()?.main_department;
  }

  getRoles(): [] {
    return this.getLoggedInUser()?.roles;
  }

  hasRole(requiredRoleId: number): boolean {
    const user = this.getLoggedInUser();
    if (!user || !user.roles) return false;
    return user.roles.some((role: any) => role.id === requiredRoleId);
  }

  // ... [Existing Data Fetching Methods] ...

  getAllEmployees(): Observable<any> {
    const url = `${this.appSettings.settings.baseUrl}/employees`;
    return this.http.get(url);
  }

  getAllDepartments() {
    const url = `${this.appSettings.settings.baseUrl}/departments`;
    return this.http.get(url);
  }

  getAllServices() {
    const url = `${this.appSettings.settings.baseUrl}/services`;
    return this.http.get(url);
  }

  // ... [Existing Token Logic] ...

  refreshToken(): Observable<any> {
    const url = `${this.appSettings.settings.baseUrl}/refresh`;
    const refreshToken = localStorage.getItem('refresh_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${refreshToken}`
    });
    return this.http.post(url, {}, { headers });
  }

  getAuthHeaders(): { [header: string]: string } {
    const token = localStorage.getItem('access_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  // -----------------------------------------------------------
  // NEW: Forgot Password Logic
  // -----------------------------------------------------------

  /**
   * Step 1: Verify user identity via Email and Mobile Number.
   * Backend Endpoint: POST /api/auth/verify-identity
   */
  verifyIdentity(email: string, mob_no: string): Observable<any> {
    // Note: ensure your backend blueprint prefix matches '/api/auth'
    const url = `${this.appSettings.settings.baseUrl}/verify-identity`;
    return this.http.post(url, { email, mob_no });
  }

  /**
   * Step 2: Reset the password for the verified email.
   * Backend Endpoint: POST /api/auth/reset-password
   */
  resetPassword(email: string, password: string): Observable<any> {
    const url = `${this.appSettings.settings.baseUrl}/reset-password`;
    return this.http.post(url, { email, password });
  }

}