import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../../../services/aswims/auth.service';
import { Router } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatSidenav } from '@angular/material/sidenav';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  currentUser: any;
  canManageUsers: boolean = false;
  @ViewChild('sidenav') sidenav!: MatSidenav;
  isMobile = false;

  constructor(private authService: AuthService, private router: Router, private breakpointObserver: BreakpointObserver,) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getUser();
    this.canManageUsers = this.authService.canManageUsers();

    // Safety check: if no user data, kick back to login
    if (!this.currentUser) {
      this.onLogout();
    }

    // Observe screen size changes
    this.breakpointObserver.observe([Breakpoints.Handset])
      .subscribe(result => {
        this.isMobile = result.matches;
      });
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/aswims/login']);
  }
  // Close sidenav after clicking a link on mobile
  closeOnMobile() {
    if (this.isMobile) {
      this.sidenav.close();
    }
  }
}
