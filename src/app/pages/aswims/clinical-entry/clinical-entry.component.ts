import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-clinical-entry',
  templateUrl: './clinical-entry.component.html',
  styleUrls: ['./clinical-entry.component.scss']
})
export class ClinicalEntryComponent implements OnInit {
  clinicalForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ClinicalEntryComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { patient: any, mode: 'vitals-only' | 'full' }
  ) {
    // Initialize the form: Vitals are now optional (Validators.required removed)
    this.clinicalForm = this.fb.group({
      // BP: Optional, but if entered, must match 120/80 format
      bp: ['', [Validators.pattern(/^\d{2,3}\/\d{2,3}$/)]], 
      
      // Temp: Optional, but if entered, must be between 30 and 45
      temp: [null, [Validators.min(30), Validators.max(45)]],
      
      // Pulse: Optional, but if entered, must be between 30 and 250
      pulse: [null, [Validators.min(30), Validators.max(250)]],
      
      // SpO2: Optional, but if entered, must be between 50 and 100
      spo2: [null, [Validators.min(50), Validators.max(100)]],
      
      // Clinical Section
      daily_notes: ['', Validators.required], // Required by default, modified in ngOnInit
    });
  }

  ngOnInit(): void {
    this.applyModeValidation();
  }

  /**
   * Adjusts validation rules for Daily Notes based on the entry mode.
   */
  private applyModeValidation(): void {
    const notesControl = this.clinicalForm.get('daily_notes');

    if (this.data.mode === 'vitals-only') {
      // For quick vitals, daily notes are not mandatory
      notesControl?.clearValidators();
    } else {
      // For full clinical records, notes are mandatory
      notesControl?.setValidators([Validators.required, Validators.minLength(5)]);
    }
    
    notesControl?.updateValueAndValidity();
  }

  saveEntry(): void {
    if (this.clinicalForm.valid) {
      const formValue = this.clinicalForm.value;
      
      // Construct the payload
      const payload = {
        patient_id: this.data.patient.id,
        mode: this.data.mode,
        ...formValue,
        // Default text if notes are skipped in vitals-only mode
        daily_notes: this.data.mode === 'vitals-only' 
          ? (formValue.daily_notes || 'Vitals recorded.') 
          : formValue.daily_notes
      };

      this.dialogRef.close(payload);
    }
  }
}