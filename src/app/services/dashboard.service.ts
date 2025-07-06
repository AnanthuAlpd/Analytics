import { Injectable } from '@angular/core';
import { AppSettings } from '../app.settings';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class DashBoardService {

  constructor(private http: HttpClient, private appSettings: AppSettings) { }

  getLineChartAll(productId?: number, months?: number): Observable<any> {
    const url = `${this.appSettings.settings.baseUrl}/sales-chart`;
    const params: any = {};

    if (productId) params.product_id = productId;
    if (months) params.months = months;

    return this.http.get(url, { params });
  }
  getProducts(): Observable<any> {
    const url = `${this.appSettings.settings.baseUrl}/products`;
    return this.http.get(url);
  }
  getDataTable(): Observable<any> {
    const url = `${this.appSettings.settings.baseUrl}/sales-table`;
    return this.http.get(url);
  }
  getRevenueChart(): Observable<any> {
    const url = `${this.appSettings.settings.baseUrl}/revenue-chart`;
    return this.http.get(url);
  }

  getClientKpiCard(): Observable<any> {
    const url = `${this.appSettings.settings.baseUrl}/sales/summary`;
    return this.http.get(url);
  }
  getClientTopTenProductsChart(): Observable<any> {
    const url = `${this.appSettings.settings.baseUrl}/sales/top_10_selling_products`;
    return this.http.get(url);
  }
  getClientTopRevenueProductsChart(): Observable<any> {
    const url = `${this.appSettings.settings.baseUrl}/sales/top_10_revenue_products`;
    return this.http.get(url);
  }

  getLeastSellingProducts(): Observable<any> {
    const url = `${this.appSettings.settings.baseUrl}/sales/least_selling_products`;
    return this.http.get(url);
  }
  
  getUnsoldProducts(): Observable<any> {
    const url = `${this.appSettings.settings.baseUrl}/sales/unsold_products`;
    return this.http.get(url);
  }

  getTopRateProducts(): Observable<any> {
    const url = `${this.appSettings.settings.baseUrl}/sales/top_valued_products`;
    return this.http.get(url);
  }
}
