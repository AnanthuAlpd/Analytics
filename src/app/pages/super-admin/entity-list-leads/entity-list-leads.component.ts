import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LeadsService, Lead } from '../../../services/leads.service';
import { Observable, map } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { LeadsFormComponent } from 'src/app/shared/components/leads-form/leads-form.component';
import { LeadDetailComponent } from 'src/app/shared/components/lead-detail/lead-detail.component';
import { DashBoardService } from 'src/app/services/dashboard.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';

@Component({
  selector: 'app-entity-list-leads',
  templateUrl: './entity-list-leads.component.html',
  styleUrls: ['./entity-list-leads.component.scss']
})
export class EntityListLeadsComponent implements OnInit {
  leads$: Observable<Lead[]>;
  followUpCount$: Observable<number>;
  showingFollowUps: boolean = false;
  leadType: string = '';
  title: string = '';
  displayedColumns: string[] = ['name', 'contact', 'emp_name', 'lead_source', 'status', 'created_at', 'actions'];

  constructor(
    private leadsService: LeadsService,
    private dashBoardService: DashBoardService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private snackbar: SnackbarService,
    private swal: SweetAlertService
  ) { }

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.leadType = data['type'];
      this.title = data['breadcrumb'];

      if (this.showingFollowUps) {
        this.leads$ = this.leadsService.getAllFollowUpLeads();
      } else {
        if (this.leadType === 'employee') {
          this.leads$ = this.leadsService.getEmployeeLeads();
        } else {
          this.leads$ = this.leadsService.getClientLeads();
        }
      }
    });

    // Initialize KPI counter
    this.followUpCount$ = this.leadsService.getAllFollowUpLeads().pipe(
      map(leads => leads.length)
    );
  }

  toggleFollowUps(): void {
    this.showingFollowUps = !this.showingFollowUps;
    this.refreshLeads();
  }

  getInitials(name: string): string {
    if (!name) return '';
    return name.split(' ')
               .map(n => n[0])
               .join('')
               .toUpperCase()
               .substring(0, 2);
  }

  getStatusClass(status: string): string {
    return status ? status.toLowerCase().replace(' ', '-') : '';
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

  async onDelete(lead: Lead): Promise<void> {
    const confirmed = await this.swal.confirm(
      'Are you sure?',
      `You are about to delete lead for ${lead.name}. This action cannot be undone.`,
      'Yes, delete it!'
    );

    if (confirmed) {
      this.dashBoardService.deleteLead(lead.id).subscribe({
        next: () => {
          this.snackbar.showSuccess('Lead deleted.');
          this.refreshLeads();
        },
        error: (err) => {
          this.snackbar.showError('Error deleting lead.');
          console.error(err);
        }
      });
    }
  }

  private refreshLeads(): void {
    if (this.showingFollowUps) {
      this.leads$ = this.leadsService.getAllFollowUpLeads();
    } else {
      if (this.leadType === 'employee') {
        this.leads$ = this.leadsService.getEmployeeLeads();
      } else {
        this.leads$ = this.leadsService.getClientLeads();
      }
    }
  }
}