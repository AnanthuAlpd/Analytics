import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface OptimizedProduct {
    product_id: number;
    name: string;
    unit_cost: number;
    unit_profit: number;
    avg_monthly_sales: number;
    current_stock: number;
    purchasing_need: number;
    score: number;
    recommended_qty: number;
    subtotal: number;
}

export interface OptimizationData {
    budget_provided: number;
    months_coverage: number;
    total_investment: number;
    remaining_budget: number;
    shopping_list: OptimizedProduct[];
    investment_trend?: number[];
    budget_trend?: number[];
    items_trend?: number[];
}

export interface BaseResponse<T> {
    status: string;
    message: string;
    data?: T;
}

@Injectable({
    providedIn: 'root'
})
export class BudgetShopperService {

    // Pointing to your local Flask Backend
    private apiUrl = 'http://localhost:5000/api/optimize-budget';

    constructor(private http: HttpClient) { }

    getOptimizedList(budgetAmount: number, monthsCoverage: number = 6): Observable<BaseResponse<OptimizationData>> {
        const payload = {
            budget: budgetAmount,
            months_coverage: monthsCoverage
        };

        return this.http.post<BaseResponse<OptimizationData>>(this.apiUrl, payload);
    }
}
