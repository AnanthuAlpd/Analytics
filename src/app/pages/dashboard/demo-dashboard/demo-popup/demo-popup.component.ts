import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-demo-popup',
  templateUrl: './demo-popup.component.html',
  styleUrls: ['./demo-popup.component.scss']
})
export class DemoPopupComponent  {

  constructor(public dialogRef: MatDialogRef<DemoPopupComponent>) {}

  close(): void {
    this.dialogRef.close();
  }

}
