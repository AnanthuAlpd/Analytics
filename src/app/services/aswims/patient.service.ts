import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { AppSettings } from '../../app.settings';

@Injectable({
    providedIn: 'root'
})
export class PatientService {
    private baseUrl: string;

    constructor(private http: HttpClient, private appSettings: AppSettings) {
        this.baseUrl = `${this.appSettings.settings.baseUrl}/aswims`;
    }

    /**
     * Fetch the list of wards for the admission form dropdown
     * Endpoint: GET /aswims/wards
     */
    getWards(): Observable<any> {
        return this.http.get(`${this.baseUrl}/wards`);
    }

    /**
     * Register a new patient admission
     * Endpoint: POST /aswims/register
     * @param patientData { name, ward_id, bed_no, diagnosis, doa }
     */
    registerPatient(patientData: any): Observable<any> {
        return this.http.post(`${this.baseUrl}/register`, patientData);
    }

    getPatientsByWard(wardId: number): Observable<any> {
        const url = `${this.baseUrl}/patients/ward/${wardId}`;
        return this.http.get(url);
    }

    getPatientById(patientId): Observable<any> {
        const url = `${this.baseUrl}/get_patient_by_id/${patientId}`;
        return this.http.get(url);
    }

    getMedFrequencies(): Observable<any> {
        const url = `${this.baseUrl}/med-frequencies`;
        return this.http.get(url);
    }

    getMedCategories(): Observable<any> {
        const url = `${this.baseUrl}/med-categories`;
        return this.http.get(url);
    }

    saveClinicalEntry(payload: any): Observable<any> {
        return this.http.post(`${this.baseUrl}/clinical-entry`, payload);
    }

    getPatientHistory(patientId: number): Observable<any> {
        const url = `${this.baseUrl}/patients/${patientId}/history`;
        
        return this.http.get<any>(url).pipe(
          map(response => {
            // Logic to handle or transform response if needed
            return response;
          })
        );
      }
}