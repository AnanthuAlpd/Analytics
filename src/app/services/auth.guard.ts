import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    const userJson = localStorage.getItem('user');
    const userType = localStorage.getItem('userType');
    const expectedRole = route.data['expectedRole']; // e.g., 'EMPLOYEE' or 'CLIENT'
    const requiredRoleId = route.data['role_id']; // e.g., 1 for Super Admin

    if (!userJson || !userType) {
      this.router.navigate(['/login/employee']);
      return false;
    }

    const user = JSON.parse(userJson);

    // User type check
    if (expectedRole && userType !== expectedRole) {
      this.router.navigate(['/dashboard']);
      return false;
    }

    // Role ID check
    if (requiredRoleId && !this.authService.hasRole(requiredRoleId)) {
      this.router.navigate(['/unauthorized']);
      return false;
    }

    return true;
  }
}
