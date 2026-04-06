import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppSettings } from '../app.settings';

export interface Employee {
  id: number;
  name: string;
  email: string;
  mob_no: string;
  department_id: number;
  parent_id: number;
  created_at: string;
  department: Department | null;
  roles: Role[];
  other_departments?: Department[];
}

export interface Client {
  client_id: number;
  name: string;
  email: string;
  phone: string;
  service_name: string;
  ref_emp_name: string;
  created_at: string;
}
export interface Department {
  id: number;
  name: string;
}

export interface Role {
  id: number;
  name: string;
  descriptions: string;
}

@Injectable({
  providedIn: 'root'
})
export class SuperAdminService {
  private apiUrl: string;
  constructor(private http: HttpClient, private appSettings: AppSettings) {
    this.apiUrl = this.appSettings.settings.baseUrl;
  }

  getAllEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.apiUrl}/employees`);
  }
  getAllClients(): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.apiUrl}/clients`);
  }
  getAllDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(`${this.apiUrl}/departments`);
  }
  getAllRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.apiUrl}/roles`);
  }
  updateEmployee(employeeId: number, payload: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/update-employee/${employeeId}`, payload);
  }
  createDepartment(payload: Partial<Department>): Observable<Department> {
    return this.http.post<Department>(`${this.apiUrl}/departments`, payload);
  }

  updateDepartment(departmentId: number, payload: Partial<Department>): Observable<Department> {
    return this.http.put<Department>(`${this.apiUrl}/departments/${departmentId}`, payload);
  }

  createRole(payload: Partial<Role>): Observable<Role> {
    return this.http.post<Role>(`${this.apiUrl}/roles`, payload);
  }

  updateRole(roleId: number, payload: Partial<Role>): Observable<Role> {
    return this.http.put<Role>(`${this.apiUrl}/roles/${roleId}`, payload);
  }

  deleteRole(roleId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/roles/${roleId}`);
  }
}
