import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    const user = localStorage.getItem('user');
    const userType = localStorage.getItem('userType');
    const expectedRole = route.data['expectedRole']; // e.g., 'EMPLOYEE' or 'CLIENT'

    if (!user || !userType) {
      this.router.navigate(['/login']);
      return false;
    }

    if (expectedRole && userType !== expectedRole) {
      this.router.navigate(['/dashboard']);
      return false;
    }

    return true;
  }
}
