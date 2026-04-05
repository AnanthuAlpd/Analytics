import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LeadsService, Lead } from '../../../services/leads.service';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { LeadsFormComponent } from 'src/app/shared/components/leads-form/leads-form.component';
import { LeadDetailComponent } from 'src/app/shared/components/lead-detail/lead-detail.component';
import { DashBoardService } from 'src/app/services/dashboard.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-my-leads',
  templateUrl: './my-leads.component.html',
  styleUrls: ['./my-leads.component.scss']
})
export class MyLeadsComponent implements OnInit {
  leads$: Observable<Lead[]>;
  leadType: string = '';
  title: string = '';
  displayedColumns: string[] = ['name', 'email', 'mob_no', 'lead_source', 'status', 'remarks', 'created_at', 'actions'];

  constructor(
    private leadsService: LeadsService,
    private dashBoardService: DashBoardService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.leadType = data['type'];
      this.title = data['breadcrumb'];
      
      if (this.leadType === 'employee') {
        this.leads$ = this.leadsService.getCurrentUserEmployeeLeads();
      } else {
        this.leads$ = this.leadsService.getCurrentUserClientLeads();
      }
    });
  }

  getStatusClass(status: string): string {
    return status ? status.toLowerCase().replace(' ', '-') : '';
  }

  onAddLead(): void {
    const dialogRef = this.dialog.open(LeadsFormComponent, {
      width: '500px',
      data: { lead_cat: this.leadType === 'employee' ? 'Employee' : 'Client' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refreshLeads();
      }
    });
  }

  onView(lead: Lead): void {
    const dialogRef = this.dialog.open(LeadDetailComponent, {
      width: '900px',
      data: { lead: lead },
      panelClass: 'glass-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refreshLeads();
      }
    });
  }

  onEdit(lead: Lead): void {
    const dialogRef = this.dialog.open(LeadsFormComponent, {
      width: '500px',
      data: { item: lead, lead_cat: lead.lead_cat }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refreshLeads();
      }
    });
  }

  onDelete(lead: Lead): void {
    if (confirm(`Are you sure you want to delete lead for ${lead.name}?`)) {
      this.dashBoardService.deleteLead(lead.id).subscribe({
        next: () => {
          this.snackBar.open('Lead deleted.', 'Close', { duration: 2000 });
          this.refreshLeads();
        },
        error: (err) => {
          this.snackBar.open('Error deleting lead.', 'Close', { duration: 3000 });
          console.error(err);
        }
      });
    }
  }

  private refreshLeads(): void {
    if (this.leadType === 'employee') {
      this.leads$ = this.leadsService.getCurrentUserEmployeeLeads();
    } else {
      this.leads$ = this.leadsService.getCurrentUserClientLeads();
    }
  }
}
