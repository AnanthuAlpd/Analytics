import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AppSettings } from '../app.settings';
import { AuthService } from './auth.service';
export interface Lead {
  id: number;
  emp_id: number;
  emp_name?: string;
  name: string;
  lead_cat: 'Employee' | 'Client';
  email: string;
  mob_no: string;
  lead_source_id?: number;
  status_id?: number;
  status?: string;
  lead_source?: string;
  remarks: string;
  created_at: string;
  follow_up_date?: string;
}

export interface LeadActivity {
  id: number;
  lead_id: number;
  emp_id: number;
  emp_name?: string;
  action_type: 'Status Change' | 'Note Added' | 'Lead Created' | 'Contact Attempt';
  details: string;
  old_value?: string;
  new_value?: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class LeadsService {

  private apiUrl: string;
  constructor(private http: HttpClient, private appSettings: AppSettings, private authService: AuthService) { 
    this.apiUrl = this.appSettings.settings.baseUrl; 
  }

  getAllLeads(): Observable<Lead[]> {
    return this.http.get<any>(`${this.apiUrl}/leads/getall`).pipe(
      map(res => {
        if (res && res.assigned_leads) return res.assigned_leads;
        if (res && res.data) return res.data;
        if (Array.isArray(res)) return res;
        return [];
      })
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

  getCurrentUserEmployeeLeads(): Observable<Lead[]> {
    const currentUser = this.authService.getLoggedInUser();
    const currentUserId = currentUser ? currentUser.id : null;
    return this.getAllLeads().pipe(
      map(leads => leads.filter(l => l.emp_id === currentUserId && l.lead_cat === 'Employee'))
    );
  }

  getCurrentUserClientLeads(): Observable<Lead[]> {
    const currentUser = this.authService.getLoggedInUser();
    const currentUserId = currentUser ? currentUser.id : null;
    return this.getAllLeads().pipe(
      map(leads => leads.filter(l => l.emp_id === currentUserId && l.lead_cat === 'Client'))
    );
  }

  getFollowUpLeads(): Observable<Lead[]> {
    return this.http.get<any>(`${this.apiUrl}/leads/follow-ups`).pipe(
      map(res => {
        if (res && res.data) return res.data;
        if (Array.isArray(res)) return res;
        return [];
      })
    );
  }

  getAllFollowUpLeads(): Observable<Lead[]> {
    return this.http.get<any>(`${this.apiUrl}/leads/follow-ups/all`).pipe(
      map(res => {
        if (res && res.data) return res.data;
        if (Array.isArray(res)) return res;
        return [];
      })
    );
  }

  // --- Activity Tracking Methods ---

  getLeadActivities(leadId: number): Observable<LeadActivity[]> {
    const url = `${this.apiUrl}/leads/${leadId}/activities`;
    return this.http.get<any>(url).pipe(
      map(res => {
        // Handle both { data: [...] } and directly returning [...]
        if (res && res.data) return res.data;
        if (Array.isArray(res)) return res;
        return [];
      })
    );
  }

  addLeadActivity(activity: Partial<LeadActivity>): Observable<any> {
    const url = `${this.apiUrl}/leads/activities/add`;
    return this.http.post(url, activity);
  }

  getLeadStatuses(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/leads/statuses`);
  }

  getLeadSources(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/leads/sources`);
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