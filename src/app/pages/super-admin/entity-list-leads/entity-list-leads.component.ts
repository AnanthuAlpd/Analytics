import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LeadsService, Lead } from '../../../services/leads.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-entity-list-leads',
  templateUrl: './entity-list-leads.component.html',
  styleUrls: ['./entity-list-leads.component.scss']
})
export class EntityListLeadsComponent implements OnInit {
  leads$: Observable<Lead[]>;
  leadType: string = '';
  title: string = '';
  displayedColumns: string[] = ['name', 'email', 'mob_no', 'lead_source', 'status', 'remarks', 'created_at', 'actions'];

  constructor(
    private leadsService: LeadsService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.leadType = data['type'];
      this.title = data['breadcrumb'];
      
      if (this.leadType === 'employee') {
        this.leads$ = this.leadsService.getEmployeeLeads();
      } else {
        this.leads$ = this.leadsService.getClientLeads();
      }
    });
  }

  getStatusClass(status: string): string {
    return status.toLowerCase().replace(' ', '-');
  }

  onView(lead: Lead): void {
    console.log('View lead:', lead);
  }

  onEdit(lead: Lead): void {
    console.log('Edit lead:', lead);
  }

  onDelete(lead: Lead): void {
    console.log('Delete lead:', lead);
  }
}