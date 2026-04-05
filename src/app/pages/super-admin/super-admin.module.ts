import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/services/auth.guard';
import { EntityListEmpClientComponent } from './entity-list-emp-client/entity-list-emp-client.component';
import { EntityListLeadsComponent } from './entity-list-leads/entity-list-leads.component';
import { SharedModule } from '../../shared/shared.module';

export const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'employee-list',
        component: EntityListEmpClientComponent,
        data: { type: 'employee',breadcrumb: 'Employee List' }
      },
      {
        path: 'client-list',
        component: EntityListEmpClientComponent,
        data: { type: 'client',breadcrumb: 'Client List' }
      },
      {
        path: 'leads/emp-leads-list',
        component: EntityListLeadsComponent,
        data: { type: 'employee', breadcrumb: 'Employee Leads List' }
      },
      {
        path: 'leads/client-leads-list',
        component: EntityListLeadsComponent,
        data: { type: 'client', breadcrumb: 'Client Leads List' }
      }
    ]
  },
  
];

@NgModule({
  declarations: [
    EntityListLeadsComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)  
  ]
})
export class SuperAdminModule { }
