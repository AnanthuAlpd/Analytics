import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LeadsService, Lead } from '../../../services/leads.service';
import { Observable, combineLatest, map, switchMap, of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { LeadsFormComponent } from 'src/app/shared/components/leads-form/leads-form.component';
import { LeadDetailComponent } from 'src/app/shared/components/lead-detail/lead-detail.component';
import { DashBoardService } from 'src/app/services/dashboard.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';

@Component({
  selector: 'app-my-leads',
  templateUrl: './my-leads.component.html',
  styleUrls: ['./my-leads.component.scss']
})
export class MyLeadsComponent implements OnInit {
  leads$: Observable<Lead[]>;
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
    this.leads$ = combineLatest([
      this.route.data,
      this.route.queryParams
    ]).pipe(
      switchMap(([data, params]) => {
        const currentType = data['type'];
        const isRecentOnly = params['recent'] === 'true';

        // Wrap state updates in setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
        setTimeout(() => {
          this.leadType = currentType;
          this.title = data['breadcrumb'];
        });

        let baseObservable$: Observable<Lead[]>;
        if (currentType === 'employee') {
          baseObservable$ = this.leadsService.getCurrentUserEmployeeLeads();
        } else {
          baseObservable$ = this.leadsService.getCurrentUserClientLeads();
        }

        return baseObservable$.pipe(
          map(leads => isRecentOnly ? this.filterByCurrentMonth(leads) : leads)
        );
      })
    );
  }

  private filterByCurrentMonth(leads: Lead[]): Lead[] {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return leads.filter(l => {
      const d = new Date(l.created_at);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'new': return 'status-new';
      case 'contacted': return 'status-contacted';
      case 'qualified': return 'status-qualified';
      case 'lost': return 'status-lost';
      case 'converted': return 'status-converted';
      default: return 'status-default';
    }
  }

  onAddLead(): void {
    const dialogRef = this.dialog.open(LeadsFormComponent, {
      width: '600px',
      data: { type: this.leadType }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refreshLeads();
      }
    });
  }

  getInitials(name: string): string {
    if (!name) return '';
    return name.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
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
      width: '600px',
      data: { lead: lead, type: this.leadType }
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
          this.snackbar.showSuccess('Lead deleted successfully');
          this.refreshLeads();
        },
        error: (err) => {
          console.error('Delete error:', err);
          this.snackbar.showError('Error deleting lead');
        }
      });
    }
  }

  private refreshLeads(): void {
    // Re-trigger the data fetch by re-initializing (reactivity will handle the rest)
    this.ngOnInit();
  }
}
