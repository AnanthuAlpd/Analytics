import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PatientService } from '../../../services/aswims/patient.service';
import { Router } from '@angular/router';
import { NotificationService } from '../../../services/aswims/notification.service';

@Component({
  selector: 'app-patient-entry',
  templateUrl: './patient-entry.component.html',
  styleUrls: ['./patient-entry.component.scss']
})
export class PatientEntryComponent implements OnInit {
  patientForm: FormGroup;
  wards: any[] = [];
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService, // Injecting the new service
    private router: Router,
    private notify: NotificationService
  ) {
    this.patientForm = this.fb.group({
      name: ['', [Validators.required]],
      ward_id: [1, Validators.required], // Default: Acute Surgical
      bed_no: ['', Validators.required],
      diagnosis: ['', Validators.required],
      doa: [new Date().toISOString(), Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadWards();
  }

  loadWards(): void {
    this.patientService.getWards().subscribe({
      next: (res) => {
        if (res.status === 'success') {
          this.wards = res.data;
        }
      },
      error: (err) => this.notify.error('Error loading wards')
    });
  }

  onSubmit(): void {
    if (this.patientForm.valid) {
      this.isLoading = true;

      // Ensure date is in ISO string for Flask
      const payload = {
        ...this.patientForm.value,
        doa: new Date(this.patientForm.value.doa).toISOString()
      };

      this.patientService.registerPatient(payload).subscribe({
        next: (res) => {
          this.notify.success(res.message)
          this.router.navigate(['/aswims/dashboard']);
        },
        error: (err) => {
          this.isLoading = false;
          this.notify.error(err.error?.message || 'Admission failed')
        }
      });
    }
  }
}