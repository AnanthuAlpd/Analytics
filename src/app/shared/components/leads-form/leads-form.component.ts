import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DashBoardService } from 'src/app/services/dashboard.service';

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
  statusOptions = ['New', 'Contacted', 'Converted', 'Rejected'];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<LeadsFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dashBoardService: DashBoardService,
    private snackBar: MatSnackBar
  ) {
    this.isEditMode = !!(this.data && this.data.item);
  }

  ngOnInit(): void {
    const item = this.data?.item;
    this.leadForm = this.fb.group({
      name: [item?.name || '', [Validators.required, Validators.minLength(2)]],
      lead_cat: [{ value: this.data?.lead_cat || item?.lead_cat || '', disabled: !this.isEditMode }, Validators.required],
      email: [item?.email || '', [Validators.required, Validators.email]],
      mob_no: [item?.mob_no || '', [Validators.pattern(/^[+]?[\d\s\-\(\)]+$/)]],
      lead_source: [item?.lead_source || ''],
      status: [{ value: item?.status || 'New', disabled: !this.isEditMode }],
      remarks: [item?.remarks || '']
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
            this.snackBar.open('✅ Lead updated successfully!', 'Close', { duration: 3000 });
            this.loading = false;
            this.dialogRef.close(true);
          },
          error: (err) => {
            this.snackBar.open('❌ Error updating lead.', 'Close', { duration: 3000 });
            this.loading = false;
            console.error('Error updating lead:', err);
          }
        });
      } else {
        this.dashBoardService.createLead(formData).subscribe({
          next: () => {
            this.snackBar.open('✅ Lead saved successfully!', 'Close', { duration: 3000 });
            this.loading = false;
            this.dialogRef.close(true);
          },
          error: (err) => {
            this.snackBar.open('❌ Failed to save lead.', 'Close', { duration: 3000 });
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
