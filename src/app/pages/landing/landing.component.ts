import { Component } from '@angular/core';
import { AppSettings } from '../../app.settings';
import { Settings } from '../../app.settings.model';
import { MatDialog } from '@angular/material/dialog';
import { InfoDialogComponent } from './info-dialog/info-dialog.component';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent {
  public settings: Settings;
  constructor(public appSettings:AppSettings, private dialog: MatDialog) {
    this.settings = this.appSettings.settings;
  }

  ngOnInit(){
    this.settings.rtl = false;
  }

  ngAfterViewInit() {
    // THIS IS THE FIX:
    setTimeout(() => {
      this.settings.loadingSpinner = false;
    }, 0);
  }


  public scrollToDemos(){
    // (click)="scrollToDemos()"
    setTimeout(() => { window.scrollTo(0,520) });
  }

  public changeLayout(menu, menuType, isRtl){
    this.settings.menu = menu;
    this.settings.menuType = menuType;
    this.settings.rtl = isRtl;
    this.settings.theme = 'indigo-light';
  }

  public changeTheme(theme){
    this.settings.theme = theme;
  }

  openDialog(section: string, title: string): void {
    this.dialog.open(InfoDialogComponent, {
      data: { section, title },
      width: '1000px'
    });
  }
}
