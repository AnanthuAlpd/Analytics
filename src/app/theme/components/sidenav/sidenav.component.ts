import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { AppSettings } from '../../../app.settings';
import { Settings } from '../../../app.settings.model';
import { MenuService } from '../menu/menu.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { environment } from '../../../../environments/environment'

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [MenuService]
})
export class SidenavComponent implements OnInit {

  public userImage : string;
  logoImage:string;
  //'../assets/img/users/profile.png';
  public menuItems: Array<any>;
  public settings: Settings;
  userName: string = '';
  deptName: string = '';
  serviceName: string | null = null;
  isClient: boolean = false;
  constructor(public appSettings: AppSettings, public menuService: MenuService, private router: Router,private authService:AuthService) {
    this.settings = this.appSettings.settings;
  }

  ngOnInit() {
     this.userImage = `${environment.baseHref}assets/img/users/profile.png`;
     this.logoImage = `${environment.baseHref}assets/img/logo/logo.jpeg`;
    this.menuItems = this.menuService.getVerticalMenuItems();
    this.userName = this.authService.getUserName();
    this.deptName = this.authService.getDepartment();
    const userType = localStorage.getItem('userType');
    //console.log(userType);
    this.isClient = userType === 'CLIENT';
    if (this.isClient) {
      const clientData = localStorage.getItem('user');
      if (clientData) {
        const client = JSON.parse(clientData);
        this.serviceName = client.service_name || null;
      }
      console.log(this.serviceName);
      
    }
  }

  logout() {
    localStorage.removeItem('user');
    // Prevent back navigation
    window.history.pushState(null, '', '/login');
    window.history.replaceState(null, '', '/login');

    // Navigate to login
    this.router.navigate(['/login']);
  }

  public closeSubMenus() {
    let menu = document.getElementById("vertical-menu");
    if (menu) {
      for (let i = 0; i < menu.children[0].children.length; i++) {
        let child = menu.children[0].children[i];
        if (child) {
          if (child.children[0].classList.contains('expanded')) {
            child.children[0].classList.remove('expanded');
            child.children[1].classList.remove('show');
          }
        }
      }
    }
  }

}
