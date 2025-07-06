import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { LandingComponent } from './landing.component';
import { InfoDialogComponent } from './info-dialog/info-dialog.component';

export const routes: Routes = [
  { path: '', component: LandingComponent, pathMatch: 'full' },

];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule
  ],
  declarations: [
    LandingComponent,
    InfoDialogComponent
  ]
})
export class LandingModule { }
