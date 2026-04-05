import { Injectable } from '@angular/core';
import { AppSettings } from '../app.settings';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
export interface Product {
  product_id: number;
  name: string;
  hsn_no: string;
}

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

  getMonthlyTrend(productId?: number): Observable<any> {
    let params = {};
    if (productId) {
      params = { product_id: productId };
    }
    const url = `${this.appSettings.settings.baseUrl}/sales/monthly-trend`;
    return this.http.get(url,{ params });
  }

  getAllMasproduct(): Observable<any> {
    const url = `${this.appSettings.settings.baseUrl}/all-products`;
    return this.http.get(url);
  }

  getSearchProducts(search: string): Observable<Product[]> {
    const params = new HttpParams().set('search', search);
    const url = `${this.appSettings.settings.baseUrl}/products/autocomplete`;
    return this.http.get<Product[]>(url, { params });
  }

  createLead(leadData: any): Observable<any> {
    const url = `${this.appSettings.settings.baseUrl}/leads/add`;
    return this.http.post(url, leadData);
  }

  updateLead(id: number, leadData: any): Observable<any> {
    const url = `${this.appSettings.settings.baseUrl}/leads/update/${id}`;
    return this.http.put(url, leadData);
  }

  deleteLead(id: number): Observable<any> {
    const url = `${this.appSettings.settings.baseUrl}/leads/delete/${id}`;
    return this.http.delete(url);
  }

  getLeadsByEmployeeId(): Observable<any> {
    const url = `${this.appSettings.settings.baseUrl}/leads/get-leads-byEmplId`;
    return this.http.get<any>(url);
  }
  
}
