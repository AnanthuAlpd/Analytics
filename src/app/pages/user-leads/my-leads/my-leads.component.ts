import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LeadsService, Lead } from '../../../services/leads.service';
import { Observable, combineLatest, map, switchMap, of } from 'rxjs';
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
  displayedColumns: string[] = ['name', 'contact', 'emp_name', 'lead_source', 'status', 'created_at', 'actions'];

  constructor(
    private leadsService: LeadsService,
    private dashBoardService: DashBoardService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.leads$ = combineLatest([
      this.route.data,
      this.route.queryParams
    ]).pipe(
      switchMap(([data, params]) => {
        // Wrap state updates in setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
        setTimeout(() => {
          this.leadType = data['type'];
          this.title = data['breadcrumb'];
        });

        const isRecentOnly = params['recent'] === 'true';

        let baseObservable$: Observable<Lead[]>;
        if (this.leadType === 'employee') {
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
    // Current approach with combineLatest will auto-refresh if leads$ logic is reactive.
    // If service returns fresh data on each call, this might need a trigger subject.
    // For now, let's re-trigger the data fetch by re-assigning (simplest fix)
    this.ngOnInit();
  }
}
