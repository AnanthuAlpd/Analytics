import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { LoginComponent } from './login/login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RegistrationComponent } from './registration/registration.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { PatientEntryComponent } from './patient-entry/patient-entry.component';
import { WardOverviewComponent } from './ward-overview/ward-overview.component';
import { ClinicalEntryComponent } from './clinical-entry/clinical-entry.component';
import { ClinicalHistoryComponent } from './clinical-history/clinical-history.component';
import { AuthGuard } from 'src/app/services/aswims/auth.guard';
import { AuthInterceptor } from 'src/app/services/aswims/auth.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

export const routes: Routes = [
    {
        path: '',
        children: [
            { path: '', redirectTo: 'login', pathMatch: 'full' },
            { path: 'login', component: LoginComponent },
            { path: 'register', component: RegistrationComponent },
            {
                path: 'dashboard',
                canActivate: [AuthGuard],
                component: DashboardComponent, // This acts as the shell (Sidebar + Toolbar)
                children: [
                    // This will render at aswims/dashboard (Overview page)
                    { path: '', redirectTo: 'overview', pathMatch: 'full' },
                    { path: 'overview', component: WardOverviewComponent }, // Create this if needed
                    
                    // This will render at aswims/dashboard/user-management
                    { path: 'user-management', component: UserManagementComponent },
                    { path: 'patient-entry', component: PatientEntryComponent },
                ]
            }
        ]
    }
];



@NgModule({
    declarations: [
        LoginComponent,
        RegistrationComponent,
        DashboardComponent,
        UserManagementComponent,
        PatientEntryComponent,
        WardOverviewComponent,
        ClinicalEntryComponent,
        ClinicalHistoryComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        ReactiveFormsModule,
        RouterModule.forChild(routes)
    ],
    providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AuthInterceptor,
          multi: true
        }
      ],
})
export class AswimsModule { }
