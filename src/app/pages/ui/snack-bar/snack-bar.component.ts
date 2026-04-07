import { Component } from '@angular/core';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { AppSettings } from '../../../app.settings';
import { Settings } from '../../../app.settings.model';

@Component({
  selector: 'app-snack-bar',
  templateUrl: './snack-bar.component.html'
})
export class SnackBarComponent {
  public settings: Settings;
  constructor(public appSettings:AppSettings, public snackbar: SnackbarService) {
    this.settings = this.appSettings.settings; 
  }
  openSnackBar(message: string, action: string) {
    this.snackbar.showSuccess(message);
  }
}