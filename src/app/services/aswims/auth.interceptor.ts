import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private router: Router) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('access_token');
    const cleanToken = token ? token.replace(/"/g, '').trim() : '';
    // const headers = new HttpHeaders().set('Authorization', `Bearer ${cleanToken}`);

    // 1. If token exists, clone the request and add the Authorization header
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${cleanToken}`
        }
      });
    }

    // 2. Pass the request to the next handler and handle errors
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Token expired or unauthorized - Clear data and go to login
          localStorage.removeItem('access_token');
          this.router.navigate(['/unauthorized']);
          //this.router.navigate(['/aswims/login']);
        }
        return throwError(() => error);
      })
    );
  }
}