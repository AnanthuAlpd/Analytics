import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AppSettings } from '../app.settings';
import { KpiSummary, SalesData, ForecastSummary } from '../pages/dashboard/demo-dashboard/demo-dashboard-model';

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class DemoDashboardService {
  private apiUrl: string;

  constructor(private http: HttpClient, private appSettings: AppSettings) { 
    this.apiUrl = this.appSettings.settings.baseUrl; 
  }

  /** Fetch KPI summary data */
  getKpiData(): Observable<KpiSummary> {
    return this.http.get<ApiResponse<KpiSummary>>(`${this.apiUrl}/demo-dashboard/kpi`).pipe(
      map(response => {
        if (response.status !== 'success') {
          throw new Error(response.message || 'Failed to fetch KPI data');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /** Fetch sales trend (Historical + Predicted) */
  getSalesTrendData(productId?: number): Observable<SalesData[]> {
    const params: any = productId ? { product_id: productId } : {};
  
    return this.http
      .get<{ status: string; message: string; data: SalesData[] }>(
        `${this.apiUrl}/demo-dashboard/sales-trend`,
        { params }
      )
      .pipe(
        map(response => {
          if (response.status !== 'success') {
            throw new Error(response.message || 'Failed to fetch sales trend data');
          }
          return response.data; // ✅ unwrap the actual array
        }),
        catchError(this.handleError)
      );
  }
  getTopProductComparison(): Observable<SalesData[]> {
    return this.http.get<{ status: string; message: string; data: SalesData[] }>(
      `${this.apiUrl}/demo-dashboard/product-comparison`
    ).pipe(
      map(response => {
        if (response.status !== 'success') {
          throw new Error(response.message || 'Failed to fetch top product data');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  getProductGrowthData(): Observable<SalesData[]>{
    return this.http.get<{ status: string; message: string; data: SalesData[]}>(
      `${this.apiUrl}/demo-dashboard/product-growth`
    ).pipe(
      map(response => {
        if(response.status !== 'success'){
          throw new Error(response.message || 'Failed to fetch product growth data');
        }
        return response.data;
      }),
      catchError(this.handleError)
    )
  }

  getForecastSummary(topN: number = 6): Observable<ForecastSummary[]> {
    return this.http.get<{ status: string; message: string; data: ForecastSummary[] }>(
      `${this.apiUrl}/demo-dashboard/product-summary`
    ).pipe(
      map(response => {
        if (response.status !== 'success') {
          throw new Error(response.message || 'Failed to fetch forecast summary');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /** Common error handler */
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('API Error:', error);
    const errorMessage = error.error?.message || 'Server error occurred';
    return throwError(() => new Error(errorMessage));
  }
}
