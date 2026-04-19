import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { DashBoardService } from 'src/app/services/dashboard.service';
import { LeadsService } from 'src/app/services/leads.service';

@Component({
  selector: 'app-leads-form',
  templateUrl: './leads-form.component.html',
  styleUrls: ['./leads-form.component.scss']
})
export class LeadsFormComponent implements OnInit {

  leadForm!: FormGroup;
  loading = false;
  isEditMode = false;
  leadCategories = ['Client', 'Employee'];
  statuses: any[] = [];
  sources: any[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<LeadsFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dashBoardService: DashBoardService,
    private leadsService: LeadsService,
    private snackbar: SnackbarService
  ) {
    this.isEditMode = !!(this.data && this.data.item);
  }

  ngOnInit(): void {
    this.fetchMasterData();
    const item = this.data?.item;
    this.leadForm = this.fb.group({
      name: [item?.name || '', [Validators.required, Validators.minLength(2)]],
      lead_cat: [{ value: this.data?.lead_cat || item?.lead_cat || '', disabled: !this.isEditMode }, Validators.required],
      email: [item?.email || '', [Validators.required, Validators.email]],
      mob_no: [item?.mob_no || '', [Validators.pattern(/^[+]?[\d\s\-\(\)]+$/)]],
      lead_source_id: [item?.lead_source_id || ''],
      status_id: [{ value: item?.status_id || '', disabled: !this.isEditMode }],
      remarks: [item?.remarks || '']
    });
  }

  private fetchMasterData(): void {
    this.leadsService.getLeadStatuses().subscribe({
      next: (data) => {
          this.statuses = data;
          if (!this.isEditMode) {
              const newStatus = this.statuses.find(s => s.status_name === 'New');
              if (newStatus) {
                  this.leadForm.get('status_id')?.setValue(newStatus.id);
              }
          }
      },
      error: (err) => console.error('Error fetching statuses:', err)
    });
    this.leadsService.getLeadSources().subscribe({
      next: (data) => this.sources = data,
      error: (err) => console.error('Error fetching sources:', err)
    });
  }

  onSubmit(): void {
    if (this.leadForm.valid) {
      this.loading = true;
      const formData = this.leadForm.getRawValue(); 

      if (this.isEditMode) {
        // Assume updateLead exists or handle in service
        this.dashBoardService.updateLead(this.data.item.id, formData).subscribe({
          next: () => {
            this.snackbar.showSuccess('Lead updated successfully!');
            this.loading = false;
            this.dialogRef.close(true);
          },
          error: (err) => {
            this.snackbar.showError('Error updating lead.');
            this.loading = false;
            console.error('Error updating lead:', err);
          }
        });
      } else {
        this.dashBoardService.createLead(formData).subscribe({
          next: () => {
            this.snackbar.showSuccess('Lead saved successfully!');
            this.loading = false;
            this.dialogRef.close(true);
          },
          error: (err) => {
            this.snackbar.showError('Failed to save lead.');
            this.loading = false;
            console.error('Error saving lead:', err);
          }
        });
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
