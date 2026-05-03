import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Lead, LeadActivity, LeadsService, LeadStage } from 'src/app/services/leads.service';
import { LeadsFormComponent } from '../leads-form/leads-form.component';
import { SnackbarService } from 'src/app/services/snackbar.service';

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

  activityTypes: any[] = [];
  selectedActivityType = '';

  pipelineStages: LeadStage[] = [];
  loadingStages = false;
  advancingStage = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { lead: Lead },
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<LeadDetailComponent>,
    private leadsService: LeadsService,
    private snackbar: SnackbarService
  ) {
    this.lead = this.data.lead;
  }

  ngOnInit(): void {
    this.refreshActivities();
    if (this.lead.lead_cat === 'Employee') {
      this.fetchPipelineStages();
    }
    this.leadsService.getActivityTypes().subscribe(res => {
      this.activityTypes = res;
      // Default to the first type if none selected
      if (this.activityTypes && this.activityTypes.length > 0) {
          this.selectedActivityType = this.activityTypes[0].name;
      }
    });
  }

  fetchPipelineStages(): void {
    this.loadingStages = true;
    this.leadsService.getPipelineStages().subscribe({
      next: (stages) => {
        this.pipelineStages = stages;
        this.loadingStages = false;
      },
      error: (err) => {
        console.error('Error fetching pipeline stages:', err);
        this.loadingStages = false;
      }
    });
  }

  advanceStage(stage: LeadStage): void {
    if (this.advancingStage || !stage.next_stage_id) return;
    this.advancingStage = true;
    this.leadsService.advanceLeadStage(this.lead.id, stage.next_stage_id).subscribe({
      next: (res) => {
        this.snackbar.showSuccess('Lead advanced to next stage successfully!');
        this.lead.stage_id = stage.next_stage_id;
        if(res.stage_name) {
             this.lead.stage_name = res.stage_name;
        }
        if(res.follow_up_date) {
            this.lead.follow_up_date = res.follow_up_date;
        }
        this.advancingStage = false;
        this.refreshActivities();
      },
      error: (err) => {
        this.snackbar.showError('Error advancing lead.');
        this.advancingStage = false;
        console.error(err);
      }
    });
  }

  getStageClass(stage: LeadStage): string {
    if (!this.lead.stage_id) {
        if (stage.order_no === 1) return 'current';
        return 'locked';
    }
    const currentStage = this.pipelineStages.find(s => s.id === this.lead.stage_id);
    if (!currentStage) return 'locked';
    
    if (stage.id === this.lead.stage_id) return 'current';
    if (stage.order_no < currentStage.order_no) return 'completed';
    return 'locked';
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
    if (!this.selectedActivityType) {
        this.snackbar.showError('Select an activity type.');
        return;
    }

    this.savingNote = true;
    const activity: any = {
      lead_id: this.lead.id,
      activity_type_name: this.selectedActivityType,
      details: this.newNote.trim() || 'No remarks provided',
      created_at: new Date().toISOString()
    };

    this.leadsService.addLeadActivity(activity).subscribe({
      next: () => {
        this.newNote = '';
        this.savingNote = false;
        this.snackbar.showSuccess('Note added.');
        this.refreshActivities();
      },
      error: (err) => {
        this.savingNote = false;
        this.snackbar.showError('Error adding note.');
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
