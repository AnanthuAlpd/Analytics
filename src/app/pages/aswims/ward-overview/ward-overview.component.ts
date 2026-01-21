import { Component, OnInit } from '@angular/core';
import { PatientService } from '../../../services/aswims/patient.service';
import { Router } from '@angular/router';
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
  wardId = 1; // Acute Surgical Ward

  constructor(
    private patientService: PatientService,
    private notify: NotificationService,
    private router: Router
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
          this.notify.error(res.message || 'Error fetching data');
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err.error?.message || 'Server connection failed';
        this.notify.error(msg);
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

  goToPatientDetail(patientId : number) {
       this.router.navigate(['/aswims/dashboard/patient-dashboard', patientId])
  }
}