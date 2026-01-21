import { Component, OnInit } from '@angular/core';
import { Color, ScaleType } from '@swimlane/ngx-charts';
import { MatDialog } from '@angular/material/dialog';
import { ClinicalEntryComponent } from '../clinical-entry/clinical-entry.component';
import { ClinicalHistoryComponent } from '../clinical-history/clinical-history.component';
import { PatientService } from '../../../services/aswims/patient.service';
import { NotificationService } from '../../../services/aswims/notification.service';
import { ActivatedRoute, Router } from '@angular/router';

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
    { name: 'SYS', series: [{ name: '01 Jan', value: 130 }, { name: '02 Jan', value: 126 } , { name: '03 Jan', value: 120 }, { name: '04 Jan', value: 138 }] },
    { name: 'DIA', series: [{ name: '01 Jan', value: 90 }, { name: '02 Jan', value: 88 }, { name: '03 Jan', value: 80 },{ name: '04 Jan', value: 78 }] },
    { name: 'PULSE', series: [{ name: '01 Jan', value: 88 },{ name: '02 Jan', value: 72 } ,{ name: '03 Jan', value: 68 },{ name: '04 Jan', value: 62 }] }
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

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.loadPatient(id);
  }

  loadPatient(id: any) {
    // In real app, call your service here
    this.patientInfo = { name: 'John Doe', bed_no: 'S-12', diagnosis: 'Post-Op Observation', id: id };
  }

  openVitalsForm() { /* Open Dialog */ }
  openMedicationForm() { /* Open Dialog */ }
  openHistory() { /* Open Dialog */ }
}

