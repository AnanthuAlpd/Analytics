import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-info-dialog',
  templateUrl: './info-dialog.component.html',
  styleUrls: ['./info-dialog.component.scss']
})
export class InfoDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: { section: string; title: string }) { }
  ngOnInit(): void {
  }
  ngAfterViewInit() {
    const sectionEl = document.getElementById(this.data.section);
    if (sectionEl) {
      sectionEl.removeAttribute('hidden');
    }
  }
}
