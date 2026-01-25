import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PatientService } from 'src/app/services/aswims/patient.service';

@Component({
  selector: 'app-clinical-entry',
  templateUrl: './clinical-entry.component.html',
  styleUrls: ['./clinical-entry.component.scss']
})
export class ClinicalEntryComponent implements OnInit {
  clinicalForm: FormGroup;
  categories: any[] = [];
  frequencies: any[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ClinicalEntryComponent>,
    private patientService: PatientService,
    @Inject(MAT_DIALOG_DATA) public data: { patient: any, mode: 'vitals-only' | 'full' }
  ) {
    this.clinicalForm = this.fb.group({
      bp: ['', [Validators.pattern(/^\d{2,3}\/\d{2,3}$/)]],
      temp: [null, [Validators.min(30), Validators.max(45)]],
      pulse: [null, [Validators.min(30), Validators.max(250)]],
      spo2: [null, [Validators.min(50), Validators.max(100)]],
      daily_notes: [''], 
      medicines: this.fb.array([])
    });
  }

  ngOnInit(): void {
    const notesControl = this.clinicalForm.get('daily_notes');
    const medControl = this.clinicalForm.get('medicines') as FormArray;

    if (this.data.mode === 'full') {
      // 1. Setup Medicines for Full Mode
      this.addMedicineRow(); 
      this.loadMasterData();
      
      // 2. Setup Notes Validation for Full Mode
      notesControl?.setValidators([Validators.required, Validators.minLength(5)]);
    } else {
      // 1. Completely clear medicines in Vitals mode so they don't block validation
      while (medControl.length !== 0) {
        medControl.removeAt(0);
      }
      medControl.clearValidators();
      
      // 2. Clear Notes validation for Vitals mode
      notesControl?.clearValidators();
    }

    // 3. Force update the entire form status
    notesControl?.updateValueAndValidity();
    medControl.updateValueAndValidity();
    this.clinicalForm.updateValueAndValidity();
  }

  loadMasterData() {
    this.patientService.getMedCategories().subscribe(res => { 
      this.categories = res.data.med_categories; 
    });
    this.patientService.getMedFrequencies().subscribe(res => { 
      this.frequencies = res.data.med_frequencies; 
    });
  }

  get medArray() {
    return this.clinicalForm.get('medicines') as FormArray;
  }

  addMedicineRow() {
    const row = this.fb.group({
      category_id: [null, Validators.required],
      medicine_name: ['', Validators.required],
      dose: ['', Validators.required],
      frequency_id: [null, Validators.required],
      daily_count: [1, [Validators.min(1), Validators.max(6)]],
      remarks: ['']
    });
    this.medArray.push(row);
  }

  removeRow(index: number) {
    this.medArray.removeAt(index);
  }

  saveEntry(): void {
    if (this.clinicalForm.valid) {
      const payload = {
        patient_id: this.data.patient.id,
        mode: this.data.mode,
        ...this.clinicalForm.value,
        daily_notes: this.clinicalForm.value.daily_notes || 'Vitals recorded.'
      };
      this.dialogRef.close(payload);
    }
  }
}