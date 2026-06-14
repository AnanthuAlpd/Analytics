import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NgApexchartsModule } from 'ng-apexcharts';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { SharedModule } from '../../shared/shared.module';
import { DashboardComponent } from './dashboard.component';
import { InfoCardsComponent } from './info-cards/info-cards.component';
import { DiskSpaceComponent } from './disk-space/disk-space.component';
import { TodoComponent } from './todo/todo.component';
import { AnalyticsComponent } from './analytics/analytics.component';
import { AuthGuard } from 'src/app/services/auth.guard';
import { DemoDashboardComponent } from './demo-dashboard/demo-dashboard.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { DemoPopupComponent } from './demo-dashboard/demo-popup/demo-popup.component';
import { ClientDashboardComponent } from './client-dashboard/client-dashboard.component';
import { EmpDashboardComponent } from './emp-dashboard/emp-dashboard.component';
import { LeadsFormComponent } from './emp-dashboard/leads-form/leads-form.component';



export const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    data: { breadcrumb: 'Admin Dashboard', role_id: 1 }
  },
  {
    path: 'demo',
    component: DemoDashboardComponent,
    data: { breadcrumb: 'Demo Dashboard' } // Public
  },
  {
    path: 'employee',
    component: EmpDashboardComponent,
    canActivate: [AuthGuard],
    data: { breadcrumb: 'Hero Dashboard', expectedRole: 'EMPLOYEE' }
  },
  {
    path: 'client',
    component: ClientDashboardComponent,
    canActivate: [AuthGuard],
    data: { breadcrumb: 'Legend Dashboard', expectedRole: 'CLIENT' }
  }
];



@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    NgxChartsModule,
    NgApexchartsModule,
    PerfectScrollbarModule,
    SharedModule,
    NgxDatatableModule,
    ReactiveFormsModule
  ],
  declarations: [
    DashboardComponent,
    InfoCardsComponent,
    DiskSpaceComponent,
    TodoComponent,
    AnalyticsComponent,
    DemoDashboardComponent,
    DemoPopupComponent,
    ClientDashboardComponent,
    EmpDashboardComponent,
    LeadsFormComponent
  ]
})
export class DashboardModule { }
