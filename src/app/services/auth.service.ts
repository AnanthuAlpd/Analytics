import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppSettings } from '../app.settings';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient, private appSettings: AppSettings) {}

  register(userData: any): Observable<any> {
    const url = `${this.appSettings.settings.baseUrl}/add_employee`;
    return this.http.post(url, userData);
  }

  registerClient(userData: any): Observable<any> {
    const url = `${this.appSettings.settings.baseUrl}/add_client`;
    return this.http.post(url, userData);
  }

  login(loginData:any):Observable<any>{
    const url = `${this.appSettings.settings.baseUrl}/login_new`;
    return this.http.post(url, loginData);
  }
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

  getAllEmployees(){
    const url = `${this.appSettings.settings.baseUrl}/employees`;
    return this.http.get(url);
  }

  getAllDepartments(){
    const url = `${this.appSettings.settings.baseUrl}/departments`;
    return this.http.get(url);
  }
  getAllServices(){
    const url = `${this.appSettings.settings.baseUrl}/services`;
    return this.http.get(url);
  }



  refreshToken(): Observable<any> {
    const url = `${this.appSettings.settings.baseUrl}/refresh`;
    const refreshToken = localStorage.getItem('refresh_token');
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${refreshToken}`
    });
  
   // console.log('📢 Refreshing using token:', refreshToken);  // 🔍 Add this for debug
  
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
  

}
