import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

export type DashboardMode = 'admin' | 'employee';

@Injectable({
  providedIn: 'root'
})
export class DashboardModeService {
  private modeSubject = new BehaviorSubject<DashboardMode>('admin');
  public mode$: Observable<DashboardMode> = this.modeSubject.asObservable();

  constructor(private router: Router) {
    // Listen to route changes globally to sync the mode
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.syncModeFromUrl(event.urlAfterRedirects);
    });

    // Initial sync
    this.syncModeFromUrl(this.router.url);
  }

  public setMode(mode: DashboardMode) {
    this.modeSubject.next(mode);
    const route = mode === 'admin' ? '/dashboard' : '/dashboard/employee';
    this.router.navigate([route]);
  }

  public get currentMode(): DashboardMode {
    return this.modeSubject.value;
  }

  private syncModeFromUrl(url: string) {
    if (url.startsWith('/dashboard/employee')) {
      if (this.modeSubject.value !== 'employee') {
        this.modeSubject.next('employee');
      }
    } else if (url.startsWith('/dashboard')) {
      if (this.modeSubject.value !== 'admin') {
        this.modeSubject.next('admin');
      }
    }
  }
}
