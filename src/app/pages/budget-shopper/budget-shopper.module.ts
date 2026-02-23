import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSliderModule } from '@angular/material/slider';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { SharedModule } from '../../shared/shared.module';
import { BudgetShopperComponent } from './budget-shopper.component';

export const routes: Routes = [
    { path: '', component: BudgetShopperComponent, pathMatch: 'full' }
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        MatProgressSpinnerModule,
        MatSliderModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatInputModule,
        SharedModule
    ],
    declarations: [
        BudgetShopperComponent
    ]
})
export class BudgetShopperModule { }
