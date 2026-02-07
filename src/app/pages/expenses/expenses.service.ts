import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Expense {
    id?: number;
    description: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    date?: string;
}

export interface Summary {
    total_income: number;
    total_expense: number;
    balance: number;
    categories: { [key: string]: number };
}

export interface Trend {
    labels: string[];
    income: number[];
    expenses: number[];
}

@Injectable({
    providedIn: 'root'
})
export class ExpenseService {
    private apiUrl = environment.baseUrl;

    constructor(private http: HttpClient) { }

    getExpenses(): Observable<Expense[]> {
        return this.http.get<Expense[]>(`${this.apiUrl}/expenses`);
    }

    addExpense(expense: Expense): Observable<Expense> {
        return this.http.post<Expense>(`${this.apiUrl}/expenses`, expense);
    }

    updateExpense(id: number, expense: Expense): Observable<Expense> {
        return this.http.put<Expense>(`${this.apiUrl}/expenses/${id}`, expense);
    }

    deleteExpense(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/expenses/${id}`);
    }

    getSummary(): Observable<Summary> {
        return this.http.get<Summary>(`${this.apiUrl}/summary`);
    }

    getTrend(period: string = 'monthly', limit?: number): Observable<Trend> {
        let url = `${this.apiUrl}/expenses/trend?period=${period}`;
        if (limit) {
            url += `&limit=${limit}`;
        }
        return this.http.get<Trend>(url);
    }
}
