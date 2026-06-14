import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/services/auth.guard';
import { SharedModule } from '../../shared/shared.module';
import { MyLeadsComponent } from './my-leads/my-leads.component';

export const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'emp-leads-list',
        component: MyLeadsComponent,
        data: { type: 'employee', breadcrumb: 'My Hero Leads' }
      },
      {
        path: 'client-leads-list',
        component: MyLeadsComponent,
        data: { type: 'client', breadcrumb: 'My Legend Leads' }
      }
    ]
  }
];

@NgModule({
  declarations: [
    MyLeadsComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class UserLeadsModule { }
