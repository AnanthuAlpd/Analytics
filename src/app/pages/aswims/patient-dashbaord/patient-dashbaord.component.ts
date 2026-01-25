import { Component, OnInit } from '@angular/core';
import { Color, ScaleType } from '@swimlane/ngx-charts';
import { MatDialog } from '@angular/material/dialog';
import { ClinicalEntryComponent } from '../clinical-entry/clinical-entry.component';
import { ClinicalHistoryComponent } from '../clinical-history/clinical-history.component';
import { PatientService } from '../../../services/aswims/patient.service';
import { NotificationService } from '../../../services/aswims/notification.service';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';

@Component({
  selector: 'app-patient-dashbaord',
  templateUrl: './patient-dashbaord.component.html',
  styleUrls: ['./patient-dashbaord.component.scss']
})
export class PatientDashbaordComponent implements OnInit {

  isLoading = false;
  patientInfo: any;

  // Mock Data for ngx-charts
  tempData = [{
    name: 'Temp',
    series: [
      { name: '01 Jan', value: 102 },
      { name: '02 Jan', value: 100 },
      { name: '03 Jan', value: 99 },
      { name: '04 Jan', value: 98.6 }
    ]
  }];

  bpPulseData = [
    { name: 'SYS', series: [{ name: '01 Jan', value: 130 }, { name: '02 Jan', value: 126 }, { name: '03 Jan', value: 120 }, { name: '04 Jan', value: 138 }] },
    { name: 'DIA', series: [{ name: '01 Jan', value: 90 }, { name: '02 Jan', value: 88 }, { name: '03 Jan', value: 80 }, { name: '04 Jan', value: 78 }] },
    { name: 'PULSE', series: [{ name: '01 Jan', value: 88 }, { name: '02 Jan', value: 72 }, { name: '03 Jan', value: 68 }, { name: '04 Jan', value: 62 }] }
  ];

  // Mock Data for Treatment Grid
  activeMeds = [
    { category: 'Antibiotic', medicine_name: 'Acythro', dose: '500mg', frequency: 'BD', daily_count: 2 },
    { category: 'Analgesic', medicine_name: 'Nyacin', dose: '650mg', frequency: 'TDS', daily_count: 3 }
  ];

  // Mock Data for Investigation Grid
  investigations = [
    { date: '2026-01-01', tests: ['Blood Report', 'ECG'] },
    { date: '2026-01-02', tests: [] },
    { date: '2026-01-03', tests: ['Scan Report'] },
    { date: '2026-01-04', tests: [] },
    { date: '2026-01-05', tests: ['Blood Report'] },
    { date: '2026-01-06', tests: ['EEG'] }
  ];

  // Chart Schemes
  tempScheme: Color = { domain: ['#f44336'], group: ScaleType.Ordinal, selectable: true, name: 'temp' };
  bpScheme: Color = { domain: ['#2196f3', '#4caf50', '#ff9800'], group: ScaleType.Ordinal, selectable: true, name: 'bp' };

  constructor(private route: ActivatedRoute, private patientService: PatientService,private dialog: MatDialog,private notify: NotificationService    ) { }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadPatient(id);
  }



  loadPatient(id: any) {
    this.isLoading = true; // Start the spinner
    
    this.patientService.getPatientById(id)
      .pipe(
        // Map the response to the first element of the data array
        map(res => res.data[0])
      )
      .subscribe({
        next: (patient) => {
          this.patientInfo = patient;
          this.isLoading = false; // Stop the spinner on success
        },
        error: (err) => {
          this.isLoading = false; // Stop the spinner on error
          const msg = err.error?.message || 'Failed to refresh patient data';
          this.notify.error(msg);
          console.error('Refresh error:', err);
        }
      });
  }

openClinicalPortal(patient: any, mode: 'vitals-only' | 'full'): void {
  const dialogRef = this.dialog.open(ClinicalEntryComponent, {
    width: '750px',
    disableClose: true,
    data: {
      patient: patient,
      mode: mode 
    }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.saveClinicalData(result);
    }
  });
}


openVitalsForm(patient: any): void {
  this.openClinicalPortal(patient, 'vitals-only');
}


onEdit(patient: any): void {
  this.openClinicalPortal(patient, 'full');
}

saveClinicalData(payload: any): void {
  this.isLoading = true; // Turn on spinner while saving starts
  
  this.patientService.saveClinicalEntry(payload).subscribe({
    next: (res) => {
      this.notify.success(res.message || 'Data saved successfully');
      // We keep isLoading = true here because we are about to fetch fresh data
      console.log("Saving successful, refreshing dashboard...");
      //console.log(payload);
      
      this.loadPatient(payload.patient_id); 
    },
    error: (err) => {
      this.isLoading = false; // Turn off if save fails
      const msg = err.error?.message || 'Error saving record';
      this.notify.error(msg);
    }
  });
}
onViewHistory(patient: any): void {
  this.isLoading = true;
  this.patientService.getPatientHistory(patient.id).subscribe({
    next: (res) => {
      this.isLoading = false;
      if (res.status === 'success') {
        this.dialog.open(ClinicalHistoryComponent, {
          width: '700px',
          maxHeight: '90vh',
          data: { 
            patient: patient,
            history: res.data // Contains {vitals: [], notes: []}
          }
        });
      }
    },
    error: () => {
      this.isLoading = false;
      this.notify.error('Could not load history')
    }
  });
}
  //openVitalsForm() { /* Open Dialog */ }
  //openMedicationForm() { /* Open Dialog */ }
  //openHistory() { /* Open Dialog */ }
}

