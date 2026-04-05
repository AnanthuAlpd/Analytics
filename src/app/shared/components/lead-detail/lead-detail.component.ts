import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Lead, LeadActivity, LeadsService } from 'src/app/services/leads.service';
import { LeadsFormComponent } from '../leads-form/leads-form.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-lead-detail',
  templateUrl: './lead-detail.component.html',
  styleUrls: ['./lead-detail.component.scss']
})
export class LeadDetailComponent implements OnInit {

  lead: Lead;
  activities: LeadActivity[] = [];
  loadingActivities = true;
  newNote = '';
  savingNote = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { lead: Lead },
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<LeadDetailComponent>,
    private leadsService: LeadsService,
    private snackBar: MatSnackBar
  ) {
    this.lead = this.data.lead;
  }

  ngOnInit(): void {
    this.refreshActivities();
  }

  refreshActivities(): void {
    this.loadingActivities = true;
    this.leadsService.getLeadActivities(this.lead.id).subscribe({
      next: (res) => {
        // Handle null or undefined response from backend
        const data = res || [];
        this.activities = data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        this.loadingActivities = false;
      },
      error: (err) => {
        console.error('Error fetching activities:', err);
        this.activities = []; // Reset on error
        this.loadingActivities = false;
      }
    });
  }

  addNote(): void {
    if (!this.newNote.trim()) return;

    this.savingNote = true;
    const activity: Partial<LeadActivity> = {
      lead_id: this.lead.id,
      action_type: 'Note Added',
      details: this.newNote,
      created_at: new Date().toISOString()
    };

    this.leadsService.addLeadActivity(activity).subscribe({
      next: () => {
        this.newNote = '';
        this.savingNote = false;
        this.snackBar.open('Note added.', 'Close', { duration: 2000 });
        this.refreshActivities();
      },
      error: (err) => {
        this.savingNote = false;
        this.snackBar.open('Error adding note.', 'Close', { duration: 3000 });
        console.error(err);
      }
    });
  }

  getActionIcon(type: string): string {
    switch (type) {
      case 'Lead Created': return 'add_circle';
      case 'Status Change': return 'sync';
      case 'Note Added': return 'note_add';
      case 'Contact Attempt': return 'phone_callback';
      default: return 'history';
    }
  }

  onEditLead(): void {
    const dialogRef = this.dialog.open(LeadsFormComponent, {
      width: '500px',
      data: { item: this.lead, lead_cat: this.lead.lead_cat }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Refresh detail view if lead was updated
        // Here we'd ideally fetch the single lead again, but for now we close and refresh the parent
        this.dialogRef.close(true);
      }
    });
  }

}
