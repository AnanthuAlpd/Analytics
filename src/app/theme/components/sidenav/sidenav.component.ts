import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { AppSettings } from '../../../app.settings';
import { Settings } from '../../../app.settings.model';
import { MenuService } from '../menu/menu.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { environment } from '../../../../environments/environment'
import { DashboardModeService } from 'src/app/services/dashboard-mode.service';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [MenuService]
})
export class SidenavComponent implements OnInit {

  public userImage: string;
  logoImage: string;
  //'../assets/img/users/profile.png';
  public menuItems: Array<any>;
  public settings: Settings;
  userName: string = '';
  deptName: string = '';
  serviceName: string | null = null;
  isClient: boolean = false;
  loginUrl: any;
  constructor(public appSettings: AppSettings, public menuService: MenuService,
    private router: Router, private authService: AuthService,
    public dashboardModeService: DashboardModeService) {
    this.settings = this.appSettings.settings;
  }

  ngOnInit() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    let roleIds: number[] = [];
    if (user && user.roles) {
      roleIds = user.roles.map((r: any) => r.id);
    }
    // console.log("Role IDs:", roleIds);
    //console.log("User:", user);

    this.menuService.getMenusByRoles(roleIds).subscribe({
      next: (menus) => {
        this.menuItems = menus;
        //  console.log("Menus:", menus);
      },
      error: (err) => {
        console.error("Error fetching menus", err);
      }
    });
    this.userImage = `${environment.baseHref}assets/img/users/profile.png`;
    this.logoImage = `${environment.baseHref}assets/img/logo/logo.jpeg`;
    // this.menuItems = this.menuService.getVerticalMenuItems();
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
    }
  }

  logout() {
    const userType = localStorage.getItem('userType');
    
    // Call centralized logout to clear all tokens and user data
    this.authService.logout();
    localStorage.removeItem('userType');

    // Decide redirect URL based on previous session type
    let redirectUrl = '/login/employee'; 
    if (userType === 'CLIENT') {
      redirectUrl = '/login/client';
    }

    this.router.navigate([redirectUrl]);
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

  public hasAdminRole(): boolean {
    return this.authService.hasRole(1);
  }

}
