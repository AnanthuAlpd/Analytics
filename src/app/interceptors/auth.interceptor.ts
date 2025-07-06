import { Injectable } from '@angular/core';
import {
  HttpInterceptor, HttpRequest, HttpHandler,
  HttpEvent, HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const isRefreshRequest = req.url.includes('/refresh');
  
    if (isRefreshRequest) {
     // console.log('🚫 Not attaching access token for /refresh');
      return next.handle(req);
    }
  
    const token = localStorage.getItem('access_token');
    const authReq = token ? this.addTokenHeader(req, token) : req;
  
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !req.url.includes('/login_new')) {
          return this.handle401Error(authReq, next);
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
  
      //console.log('🔁 Calling refreshToken()...');

      return this.authService.refreshToken().pipe(
        switchMap((response: any) => {
          this.isRefreshing = false;
          const newToken = response.access_token;
          localStorage.setItem('access_token', newToken);
          this.refreshTokenSubject.next(newToken);

          const retryReq = this.addTokenHeader(request, newToken);
          return next.handle(retryReq);
        }),
        catchError((err) => {
          this.isRefreshing = false;
          this.authService.logout();
          return throwError(() => err);
        })
      );
    }

    return this.refreshTokenSubject.pipe(
      filter(token => token != null),
      take(1),
      switchMap((token) => {
        const retryReq = this.addTokenHeader(request, token!);
        return next.handle(retryReq);
      })
    );
  }
}
