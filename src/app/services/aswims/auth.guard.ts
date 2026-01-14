import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from './auth.service'; // Adjust path to your auth service

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // Check if user is logged in (e.g., check if token exists in localStorage)
    const token = this.authService.getAccessToken();

    if (token) {
      // User is authenticated
      return true;
    }

    // Not logged in, redirect to login page with the return url
    this.router.navigate(['/aswims/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}