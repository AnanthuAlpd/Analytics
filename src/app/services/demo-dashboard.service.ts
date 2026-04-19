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
    return this.http.get<KpiSummary>(`${this.apiUrl}/demo-dashboard/kpi`).pipe(
      catchError(this.handleError)
    );
  }

  /** Fetch KPI summary data New */
  getKpiDataNew(): Observable<KpiSummaryNew> {
    return this.http.get<KpiSummaryNew>(`${this.apiUrl}/demo-dashboard/kpi`).pipe(
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
      .get<SalesData[]>(
        `${this.apiUrl}/demo-dashboard/sales-trend`,
        { params }
      )
      .pipe(
        catchError(this.handleError)
      );
  }

  getTopProductComparison(productId?: number): Observable<SalesData[]> {
    let params = new HttpParams();
    if (productId) {
      params = params.set('product_id', productId.toString());
    }
    return this.http.get<SalesData[]>(
      `${this.apiUrl}/demo-dashboard/product-comparison`, { params }
    ).pipe(
      catchError(this.handleError)
    );
  }

  getTotalProductComparison(productId?: number): Observable<any> {
    let params = new HttpParams();
    if (productId) {
      params = params.set('product_id', productId.toString());
    }
    return this.http.get<any[]>(
      `${this.apiUrl}/demo-dashboard/product-comparison-total`, { params }
    ).pipe(
      catchError(this.handleError)
    );
  }
  getProductGrowthData(productId?: number): Observable<SalesData[]> {
    let params = new HttpParams();
    if (productId) {
      params = params.set('product_id', productId.toString());
    }
    return this.http.get<SalesData[]>(
      `${this.apiUrl}/demo-dashboard/product-growth`, { params }
    ).pipe(
      catchError(this.handleError)
    )
  }

  getTop10ProductGrowthData(productId?: number): Observable<SalesData[]> {
    let params = new HttpParams();
    if (productId) {
      params = params.set('product_id', productId.toString());
    }
    return this.http.get<SalesData[]>(
      `${this.apiUrl}/demo-dashboard/top-10-product-growth`, { params }
    ).pipe(
      catchError(this.handleError)
    )
  }

  getForecastSummary(topN: number = 6): Observable<ForecastSummary[]> {
    return this.http.get<ForecastSummary[]>(
      `${this.apiUrl}/demo-dashboard/product-summary`
    ).pipe(
      catchError(this.handleError)
    );
  }

  /** Fetch inventory health metrics */
  getInventoryHealth(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/business-analytics/inventory-health`).pipe(
      catchError(this.handleError)
    );
  }

  /** Fetch list of products for filtering */
  getProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/demo-dashboard/products`).pipe(
      catchError(this.handleError)
    );
  }

  // ===== Enhanced Business Analytics Methods =====

  /** Fetch revenue and profit metrics */
  getRevenueMetrics(): Observable<RevenueMetrics> {
    return this.http.get<RevenueMetrics>(`${this.apiUrl}/business-analytics/revenue-metrics`).pipe(
      catchError(this.handleError)
    );
  }

  /** Fetch category performance data */
  getCategoryPerformance(): Observable<CategoryPerformance[]> {
    return this.http.get<CategoryPerformance[]>(`${this.apiUrl}/business-analytics/category-performance`).pipe(
      catchError(this.handleError)
    );
  }

  /** Fetch revenue trend (revenue vs profit over time) */
  getRevenueTrend(months: number = 12): Observable<SalesData[]> {
    return this.http.get<SalesData[]>(
      `${this.apiUrl}/business-analytics/revenue-trend?months=${months}`
    ).pipe(
      catchError(this.handleError)
    );
  }

  /** Fetch business alerts */
  getBusinessAlerts(): Observable<BusinessAlert[]> {
    return this.http.get<BusinessAlert[]>(`${this.apiUrl}/business-analytics/alerts`).pipe(
      catchError(this.handleError)
    );
  }

  /** Fetch top performing products */
  getTopPerformers(limit: number = 5): Observable<TopPerformer[]> {
    return this.http.get<TopPerformer[]>(
      `${this.apiUrl}/business-analytics/top-performers?limit=${limit}`
    ).pipe(
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
