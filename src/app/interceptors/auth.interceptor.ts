import { Injectable } from '@angular/core';
import {
  HttpInterceptor, HttpRequest, HttpHandler,
  HttpEvent, HttpErrorResponse, HttpResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, switchMap, take, map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(private authService: AuthService, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const isRefreshRequest = req.url.includes('/refresh');
  
    if (isRefreshRequest) {
      return next.handle(req);
    }
  
    const token = localStorage.getItem('access_token');
    const authReq = token ? this.addTokenHeader(req, token) : req;
  
    return next.handle(authReq).pipe(
      map((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          // Skip 'aswims' endpoints as requested
          if (event.url && event.url.includes('/aswims/')) {
            return event;
          }

          // Global standard unwrap: { status: 'success', data: ... } -> data
          if (event.body && event.body.status === 'success' && event.body.hasOwnProperty('data')) {
            return event.clone({ body: event.body.data });
          }
        }
        return event;
      }),
      catchError((error: HttpErrorResponse) => {
        // Skip 'aswims' errors
        if (req.url.includes('/aswims/')) {
          return throwError(() => error);
        }

        if (error.status === 401 && !req.url.includes('/login_new')) {
          console.warn(`[Auth Interceptor] 401 Unauthorized detected for: ${req.url}. Attempting token refresh...`);
          return this.handle401Error(authReq, next);
        }
        
        if (error.status === 403) {
          console.error(`[Auth Interceptor] 403 Forbidden detected for: ${req.url}. Redirecting to unauthorized page.`);
          this.router.navigate(['/unauthorized']);
        }

        // Standardized Error Mapping
        if (error.error && error.error.status === 'error' && error.error.message) {
          // Wrap the specialized message so services catch it easily
          return throwError(() => ({
            ...error,
            message: error.error.message,
            friendlyMessage: error.error.message
          }));
        }

        return throwError(() => error);
      })
    );
  }
  

  private addTokenHeader(request: HttpRequest<any>, token: string) {
    return request.clone({
      headers: request.headers.set('Authorization', `Bearer ${token}`)
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);
  
      return this.authService.refreshToken().pipe(
        switchMap((response: any) => {
          this.isRefreshing = false;
          const newToken = response.access_token;
          if (newToken) {
            console.log('[Auth Interceptor] Token refresh successful. Resubmitting original request.');
            localStorage.setItem('access_token', newToken);
            this.refreshTokenSubject.next(newToken);
            return next.handle(this.addTokenHeader(request, newToken));
          } else {
             console.error('[Auth Interceptor] Refresh response missing token. Logging out.');
             this.authService.logout();
             this.router.navigate(['/unauthorized']);
             return throwError(() => new Error('Refresh token failed'));
          }
        }),
        catchError((err) => {
          this.isRefreshing = false;
          console.error('[Auth Interceptor] Refresh token request failed. Logging out.', err);
          this.authService.logout();
          this.router.navigate(['/unauthorized']);
          return throwError(() => err);
        })
      );
    }

    return this.refreshTokenSubject.pipe(
      filter(token => token != null),
      take(1),
      switchMap((token) => {
        return next.handle(this.addTokenHeader(request, token!));
      })
    );
  }
}
