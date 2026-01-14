import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppSettings } from '../../app.settings';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient, private appSettings: AppSettings) { }

  // ... [Existing Registration & Login Methods] ...

  registerUser(userData: any): Observable<any> {
    return this.http.post(`${this.appSettings.settings.baseUrl}/aswims/users/register`, userData);
  }


  login(loginData: any): Observable<any> {
    return this.http.post(`${this.appSettings.settings.baseUrl}/aswims/users/login`, loginData);
  }

  getAllAppointments(): Observable<any> {
    const url = `${this.appSettings.settings.baseUrl}/aswims/getAllAppointments`;
    return this.http.get(url);
  }

  getMainSpecialities(): Observable<any> {
    const url = `${this.appSettings.settings.baseUrl}/aswims/getMainSpecialities`;
    return this.http.get(url);
  }

  getSuperSpecialities(parentId): Observable<any> {
    const url = `${this.appSettings.settings.baseUrl}/aswims/getSuperSpecialities/${parentId}`;
    return this.http.get(url);
  }
  // ... [Existing User Getter Methods] ...

  // New method to save the user profile
  saveUser(user: any) {
    localStorage.setItem('user_data', JSON.stringify(user));
  }

  // New method to get user profile back as an object
  getUser() {
    const user = localStorage.getItem('user_data');
    return user ? JSON.parse(user) : null;
  }

  getAccessToken() {
    return localStorage.getItem('access_token');
  }

  logout() {
    localStorage.clear();
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }

  private readonly APPROVAL_THRESHOLD = 10;

  canManageUsers(): boolean {
    const user = this.getUser();
    // Check if the user's hierarchy level meets the requirement
    return user && user.h_level !== null && user.h_level <= this.APPROVAL_THRESHOLD;
  }

  getAllUsers(): Observable<any> {
    return this.http.get(`${this.appSettings.settings.baseUrl}/aswims/users/getAllusers`);
  }

  changeUserStatus(userId: number, status: string): Observable<any> {
    // const rawToken = this.getAccessToken();
    // FIX: Strip any double quotes that might be wrapping the token
    // const cleanToken = rawToken ? rawToken.replace(/"/g, '').trim() : '';
    // const headers = new HttpHeaders().set('Authorization', `Bearer ${cleanToken}`);
    return this.http.post(`${this.appSettings.settings.baseUrl}/aswims/update-status`, { userId, status });
  }




  // ... [Existing Token Logic] ...

  // refreshToken(): Observable<any> {
  //   const url = `${this.appSettings.settings.baseUrl}/refresh`;
  //   const refreshToken = localStorage.getItem('refresh_token');
  //   const headers = new HttpHeaders({
  //     'Authorization': `Bearer ${refreshToken}`
  //   });
  //   return this.http.post(url, {}, { headers });
  // }

  getAuthHeaders(): { [header: string]: string } {
    const token = localStorage.getItem('access_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
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