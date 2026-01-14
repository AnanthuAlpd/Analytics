import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AppSettings } from '../app.settings';
export interface Lead {
  id: number;
  emp_id: number;
  name: string;
  lead_cat: 'Employee' | 'Client';
  email: string;
  mob_no: string;
  lead_source: string;
  status: string;
  remarks: string;
  created_at: string;
}
@Injectable({
  providedIn: 'root'
})
export class LeadsService {

  private apiUrl: string;
  constructor(private http: HttpClient, private appSettings: AppSettings) { 
    this.apiUrl = this.appSettings.settings.baseUrl; 
  }

  getAllLeads(): Observable<Lead[]> {
    return this.http.get<{ data: Lead[] }>(`${this.apiUrl}/leads/getall`).pipe(
      map(res => res.data) 
    );
  }

  getEmployeeLeads(): Observable<Lead[]> {
    return this.getAllLeads().pipe(
      map(leads => leads.filter(l => l.lead_cat === 'Employee'))
    );
  }

  getClientLeads(): Observable<Lead[]> {
    return this.getAllLeads().pipe(
      map(leads => leads.filter(l => l.lead_cat === 'Client'))
    );
  }
  
}






// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable, map } from 'rxjs';
// import { AppSettings } from '../app.settings';

// export interface Lead {
//   id: number;
//   emp_id: number;
//   name: string;
//   lead_cat: 'Employee' | 'Client';
//   email: string;
//   mob_no: string;
//   lead_source: string;
//   status: string;
//   remarks: string;
//   created_at: string;
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class LeadsService {

//   private apiUrl: string;

//   constructor(private http: HttpClient, private appSettings: AppSettings) { 
//     this.apiUrl = this.appSettings.settings.baseUrl; 
//   }

//   // Base function to fetch everything from API
//   private getAllLeads(): Observable<Lead[]> {
//     return this.http.get<{ data: Lead[] }>(`${this.apiUrl}/leads/getall`).pipe(
//       map(res => res.data) 
//     );
//   }

//   // ==========================================================
//   //  SUPER ADMIN METHODS (See ALL leads from ALL users)
//   // ==========================================================

//   getAdminEmployeeLeads(): Observable<Lead[]> {
//     return this.getAllLeads().pipe(
//       map(leads => leads.filter(l => l.lead_cat === 'Employee'))
//     );
//   }

//   getAdminClientLeads(): Observable<Lead[]> {
//     return this.getAllLeads().pipe(
//       map(leads => leads.filter(l => l.lead_cat === 'Client'))
//     );
//   }

//   // ==========================================================
//   //  REGULAR USER METHODS (See only THEIR own leads)
//   // ==========================================================

//   getUserEmployeeLeads(empId: number): Observable<Lead[]> {
//     return this.getAllLeads().pipe(
//       map(leads => leads.filter(l => l.emp_id === empId && l.lead_cat === 'Employee'))
//     );
//   }

//   getUserClientLeads(empId: number): Observable<Lead[]> {
//     return this.getAllLeads().pipe(
//       map(leads => leads.filter(l => l.emp_id === empId && l.lead_cat === 'Client'))
//     );
//   }
// }