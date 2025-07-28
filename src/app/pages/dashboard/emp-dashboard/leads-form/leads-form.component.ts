import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackBarComponent } from 'src/app/pages/ui/snack-bar/snack-bar.component';
import { DashBoardService } from 'src/app/services/dashboard.service';

@Component({
  selector: 'app-leads-form',
  templateUrl: './leads-form.component.html',
  styleUrls: ['./leads-form.component.scss']
})
export class LeadsFormComponent implements OnInit {

  leadForm!: FormGroup;
  loading = false;
  leadCategories = ['Client', 'Employee'];
  statusOptions = ['New', 'Contacted', 'Converted', 'Rejected'];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<LeadsFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dashBoardService: DashBoardService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.leadForm = this.fb.group({
      name: ['', Validators.required],
      lead_cat: [{ value: this.data?.lead_cat || '', disabled: true }, Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mob_no: [''],
      lead_source: [''],
      status: [{ value: 'New', disabled: true }],
      remarks: ['']
    });
  }

  onSubmit(): void {
    if (this.leadForm.valid) {
      this.loading = true;
      const formData = this.leadForm.getRawValue(); // includes disabled (readonly) fields
  
      this.dashBoardService.createLead(formData).subscribe({
        next: (response) => {
          this.snackBar.open('✅ Lead saved successfully!', 'Close', {
            duration: 3000,
            panelClass: ['snack-success'] // optional styling
          });
          this.loading = false;
          this.dialogRef.close(true); // closes the dialog, optionally signal success
        },
        error: (err) => {
          this.snackBar.open('❌ Failed to save lead. Try again.', 'Close', {
            duration: 3000,
            panelClass: ['snack-error'] // optional styling
          });
          this.loading = false;
          console.error('Error saving lead:', err);
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

}
