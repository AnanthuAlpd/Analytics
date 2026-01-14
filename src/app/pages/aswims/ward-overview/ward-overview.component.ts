import { Component, OnInit } from '@angular/core';
import { PatientService } from '../../../services/aswims/patient.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ClinicalEntryComponent } from '../clinical-entry/clinical-entry.component';
import { ClinicalHistoryComponent } from '../clinical-history/clinical-history.component';
import { NotificationService } from '../../../services/aswims/notification.service';
@Component({
  selector: 'app-ward-overview',
  templateUrl: './ward-overview.component.html',
  styleUrls: ['./ward-overview.component.scss']
})
export class WardOverviewComponent implements OnInit {
  patients: any[] = [];
  filteredPatients: any[] = [];
  isLoading = true;
  wardId = 1; // Default: Acute Surgical Ward

  constructor(
    private patientService: PatientService,
    private notify: NotificationService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadWardData();
  }

  loadWardData(): void {
    this.isLoading = true;
    this.patientService.getPatientsByWard(this.wardId).subscribe({
      next: (res) => {
        if (res.status === 'success') {
          this.patients = res.data;
          this.filteredPatients = [...this.patients];
        } else {
          this.notify.error(res.message || 'Error fetching data')
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err.error?.message || 'Server connection failed';
        this.notify.error(msg)
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredPatients = this.patients.filter(p =>
      p.name.toLowerCase().includes(filterValue) ||
      p.bed_no.toLowerCase().includes(filterValue)
    );
  }

  // Updated Unified function to handle 'mode'
  openClinicalPortal(patient: any, mode: 'vitals-only' | 'full'): void {
    const dialogRef = this.dialog.open(ClinicalEntryComponent, {
      width: '550px',
      disableClose: true,
      data: {
        patient: patient,
        mode: mode // This tells the dialog what fields to show
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.saveClinicalData(result);
      }
    });
  }

  // Triggered by the Heart Icon - Vitals Only
  onAddVitals(patient: any): void {
    this.openClinicalPortal(patient, 'vitals-only');
  }

  // Triggered by the Edit Button - Full Entry (Notes + Meds + Vitals)
  onEdit(patient: any): void {
    this.openClinicalPortal(patient, 'full');
  }

  saveClinicalData(payload: any): void {
    this.isLoading = true;
    this.patientService.saveClinicalEntry(payload).subscribe({
      next: (res) => {
        this.notify.success(res.message || 'Data saved successfully');
        this.loadWardData(); // Refresh the grid
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err.error?.message || 'Error saving record';
        this.notify.error(msg)
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

  updateStatus(patientId: number, status: string): void {
    // This could be another service call to update 'Admitted' to 'Discharged'
    console.log(`Updating patient ${patientId} to ${status}`);
    // Once implemented: this.patientService.updateStatus(patientId, status).subscribe(...)
  }
}