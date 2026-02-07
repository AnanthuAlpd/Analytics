import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AppSettings } from '../app.settings';
import {
  KpiSummary, SalesData, ForecastSummary, KpiSummaryNew,
  RevenueMetrics, CategoryPerformance, BusinessAlert, TopPerformer
} from '../pages/dashboard/demo-dashboard/demo-dashboard-model';

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

  /** Fetch KPI summary data New */
  getKpiDataNew(): Observable<KpiSummaryNew> {
    return this.http.get<ApiResponse<KpiSummaryNew>>(`${this.apiUrl}/demo-dashboard/kpi`).pipe(
      map(response => {
        if (response.status !== 'success') {
          throw new Error(response.message || 'Failed to fetch KPI data');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  getSalesLineChart(productId?: number, months?: number): Observable<any> {
    const url = `${this.appSettings.settings.baseUrl}/sales-chart`;
    const params: any = {};

    if (productId) params.product_id = productId;
    if (months) params.months = months;

    return this.http.get(url, { params });
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

  getTotalProductComparison(): Observable<any> {
    return this.http.get<{ status: string; message: string; data: any[] }>(
      `${this.apiUrl}/demo-dashboard/product-comparison-total`
    ).pipe(
      map(response => {
        if (response.status !== 'success') {
          throw new Error(response.message || 'Failed to fetch total product comparison');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }
  getProductGrowthData(): Observable<SalesData[]> {
    return this.http.get<{ status: string; message: string; data: SalesData[] }>(
      `${this.apiUrl}/demo-dashboard/product-growth`
    ).pipe(
      map(response => {
        if (response.status !== 'success') {
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

  // ===== Enhanced Business Analytics Methods =====

  /** Fetch revenue and profit metrics */
  getRevenueMetrics(): Observable<RevenueMetrics> {
    return this.http.get<ApiResponse<RevenueMetrics>>(`${this.apiUrl}/business-analytics/revenue-metrics`).pipe(
      map(response => {
        if (response.status !== 'success') {
          throw new Error(response.message || 'Failed to fetch revenue metrics');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /** Fetch category performance data */
  getCategoryPerformance(): Observable<CategoryPerformance[]> {
    return this.http.get<ApiResponse<CategoryPerformance[]>>(`${this.apiUrl}/business-analytics/category-performance`).pipe(
      map(response => {
        if (response.status !== 'success') {
          throw new Error(response.message || 'Failed to fetch category performance');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /** Fetch revenue trend (revenue vs profit over time) */
  getRevenueTrend(months: number = 12): Observable<SalesData[]> {
    return this.http.get<ApiResponse<SalesData[]>>(
      `${this.apiUrl}/business-analytics/revenue-trend?months=${months}`
    ).pipe(
      map(response => {
        if (response.status !== 'success') {
          throw new Error(response.message || 'Failed to fetch revenue trend');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /** Fetch business alerts */
  getBusinessAlerts(): Observable<BusinessAlert[]> {
    return this.http.get<ApiResponse<BusinessAlert[]>>(`${this.apiUrl}/business-analytics/alerts`).pipe(
      map(response => {
        if (response.status !== 'success') {
          throw new Error(response.message || 'Failed to fetch business alerts');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /** Fetch top performing products */
  getTopPerformers(limit: number = 5): Observable<TopPerformer[]> {
    return this.http.get<ApiResponse<TopPerformer[]>>(
      `${this.apiUrl}/business-analytics/top-performers?limit=${limit}`
    ).pipe(
      map(response => {
        if (response.status !== 'success') {
          throw new Error(response.message || 'Failed to fetch top performers');
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
