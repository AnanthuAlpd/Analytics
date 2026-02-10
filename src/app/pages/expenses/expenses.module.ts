import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { SharedModule } from '../../shared/shared.module';
import { ExpensesComponent } from './expenses.component';

export const routes = [
    { path: '', component: ExpensesComponent, data: { breadcrumb: 'Expenses' } }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        NgxChartsModule,
        SharedModule,
        RouterModule.forChild(routes)
    ],
    declarations: [
        ExpensesComponent
    ]
})
export class ExpensesModule { }
