import { Injectable, NgModule } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { Menu } from './menu.model';
import { verticalMenuItems, horizontalMenuItems } from './menu';
import { AuthService } from 'src/app/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { AppSettings } from 'src/app/app.settings';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private apiUrl: string;
  constructor(private location: Location,
    private router: Router, private authService: AuthService,
    private http: HttpClient, private appSettings: AppSettings) { this.apiUrl = this.appSettings.settings.baseUrl; }
    
    getAllMenus(): Observable<Menu[]> {
      return this.http.get<Menu[]>(`${this.apiUrl}/get-menus`).pipe(
        map((menus: Menu[]) => this.applyDynamicRoutes(menus))
      );
    }
    
    getMenusByRoles(roleIds: number[]): Observable<Menu[]> {
      return this.http.post<Menu[]>(`${this.apiUrl}/get-menus-by-ids`, { role_ids: roleIds }).pipe(
        map((menus: Menu[]) => this.applyDynamicRoutes(menus))
      );
    }
    
    // 🔥 Private helper for dynamic route assignment
    private applyDynamicRoutes(menus: Menu[]): Menu[] {
      const userType = localStorage.getItem('userType'); // 'EMPLOYEE' | 'CLIENT'
      const isSuperAdmin = this.authService.hasRole(1);
    
      let dashboardRoute = '';
      if (isSuperAdmin) {
        dashboardRoute = '/dashboard';
      } else if (userType === 'EMPLOYEE') {
        dashboardRoute = '/dashboard/employee';
      } else if (userType === 'CLIENT') {
        dashboardRoute = '/dashboard/client';
      }
    
      // Replace dashboard's routerLink dynamically
      return menus.map(menu => {
        if (menu.title.toLowerCase() === 'dashboard') {
          return { ...menu, routerLink: dashboardRoute };
        }
        return menu;
      });
    }
    
    
    createMenu(payload: any): Observable<any> {
      return this.http.post<any>(`${this.apiUrl}/menus`, payload);
    }
  
    updateMenu(menuId: number, payload: any): Observable<any> {
      return this.http.put<any>(`${this.apiUrl}/menus/${menuId}`, payload);
    }
  
    deleteMenu(menuId: number): Observable<any> {
      return this.http.delete<any>(`${this.apiUrl}/menus/${menuId}`);
    }
  // public getVerticalMenuItems(): Array<Menu> {
  //   const userType = localStorage.getItem('userType'); // 'EMPLOYEE' or 'CLIENT'
  //   const isSuperAdmin = this.authService.hasRole(1);

  //   let dashboardRoute = '';

  //   if (isSuperAdmin) {
  //     dashboardRoute = '/dashboard'; // ✅ only Super Admin sees this
  //   } else if (userType === 'EMPLOYEE') {
  //     dashboardRoute = '/dashboard/employee';
  //   } else if (userType === 'CLIENT') {
  //     dashboardRoute = '/dashboard/client';
  //   }

  //   // Add dashboard as the first menu
  //   const dashboardItem = new Menu(
  //     1, 'Dashboard', dashboardRoute, null, 'dashboard', null, false, 0
  //   );

  //   let filteredMenu: Menu[];

  //   if (isSuperAdmin) {
  //     // Super Admin — can see all menus
  //     filteredMenu = verticalMenuItems.filter(menu =>
  //       !menu.roles || menu.roles.includes('ADMIN') || menu.roles.includes('EMPLOYEE') || menu.roles.includes('CLIENT')
  //     );
  //   } else {
  //     // Non-admin — filter menus by userType
  //     filteredMenu = verticalMenuItems.filter(menu =>
  //       !menu.roles || menu.roles.includes(userType)
  //     );
  //   }

  //   return [dashboardItem, ...filteredMenu.filter(menu => menu.id !== 1)];
  // }



  // public getHorizontalMenuItems(): Array<Menu> {
  //   return this.getVerticalMenuItems(); // reuse same logic
  // }


  public expandActiveSubMenu(menu: Array<Menu>) {
    if (!Array.isArray(menu) || menu.length === 0) {
      return;
    }

    const url = this.location.path();
    const activeMenuItem = menu.filter(item => item.routerLink === url);

    if (activeMenuItem.length > 0) {
      let menuItem = activeMenuItem[0];
      while (menuItem.parentId !== 0) {
        const parentMenuItem = menu.find(item => item.id === menuItem.parentId);
        if (!parentMenuItem) break;
        menuItem = parentMenuItem;
        this.toggleMenuItem(menuItem.id);
      }
    }
  }


  public toggleMenuItem(menuId) {
    let menuItem = document.getElementById('menu-item-' + menuId);
    let subMenu = document.getElementById('sub-menu-' + menuId);
    if (subMenu) {
      if (subMenu.classList.contains('show')) {
        subMenu.classList.remove('show');
        menuItem.classList.remove('expanded');
      }
      else {
        subMenu.classList.add('show');
        menuItem.classList.add('expanded');
      }
    }
  }

  public closeOtherSubMenus(menu: Array<Menu>, menuId) {
    let currentMenuItem = menu.filter(item => item.id == menuId)[0];
    if (currentMenuItem.parentId == 0 && !currentMenuItem.target) {
      menu.forEach(item => {
        if (item.id != menuId) {
          let subMenu = document.getElementById('sub-menu-' + item.id);
          let menuItem = document.getElementById('menu-item-' + item.id);
          if (subMenu) {
            if (subMenu.classList.contains('show')) {
              subMenu.classList.remove('show');
              menuItem.classList.remove('expanded');
            }
          }
        }
      });
    }
  }


}
