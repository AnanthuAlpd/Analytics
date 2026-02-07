import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-clinical-history',
  templateUrl: './clinical-history.component.html',
  styleUrls: ['./clinical-history.component.scss']
})
export class ClinicalHistoryComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ClinicalHistoryComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { 
      patient: any, 
      history: { vitals: any[], notes: any[] } 
    }
  ) { }

  ngOnInit(): void {
    // Sort Clinical Notes: Newest first
    if (this.data.history.notes) {
      this.data.history.notes.sort((a, b) => 
        new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime()
      );
    }

    // Sort Vitals: Newest first
    if (this.data.history.vitals) {
      this.data.history.vitals.sort((a, b) => 
        new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
      );
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }

}
