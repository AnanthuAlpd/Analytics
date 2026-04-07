import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AppSettings } from '../../../app.settings';
import { Settings } from '../../../app.settings.model';

@Component({
  selector: 'app-unauthorized',
  templateUrl: './unauthorized.component.html',
  styleUrls: ['./unauthorized.component.scss']
})
export class UnauthorizedComponent {
  public settings: Settings;
  public userType: string | null = null;

  constructor(public appSettings:AppSettings, public router:Router) {
    this.settings = this.appSettings.settings; 
    this.userType = localStorage.getItem('userType');
  }

  goLogin(type?: string): void {
    const target = type || this.userType || 'employee';
    this.router.navigate(['/login', target.toLowerCase()]);
  }

  ngAfterViewInit(){
    this.settings.loadingSpinner = false;  
  } 

}
