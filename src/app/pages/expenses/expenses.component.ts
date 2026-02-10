import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ExpenseService, Expense, Summary, Trend } from './expenses.service';

@Component({
    selector: 'app-expenses',
    templateUrl: './expenses.component.html',
    styleUrls: ['./expenses.component.scss']
})
export class ExpensesComponent implements OnInit {
    expenses: Expense[] = [];
    summary: Summary = {
        total_income: 0,
        total_expense: 0,
        balance: 0,
        categories: {}
    };

    newExpense: Expense = {
        description: '',
        amount: 0,
        type: 'expense',
        category: '',
        date: new Date().toISOString().substring(0, 10)
    };

    editingExpenseId: number | null = null;
    selectedPeriod: string = 'monthly';

    // ngx-charts data
    pieData: any[] = [];
    lineData: any[] = [];

    colorScheme = {
        domain: ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f59e0b', '#10b981']
    };

    constructor(private expenseService: ExpenseService, private cdr: ChangeDetectorRef) { }

    ngOnInit() {
        this.loadData();
    }

    loadData() {
        // Load expenses list
        this.expenseService.getExpenses().subscribe(data => {
            this.expenses = [...data];
            this.cdr.detectChanges();
        });

        // Load summary for cards and pie chart
        this.expenseService.getSummary().subscribe(data => {
            this.summary = data;
            this.updatePieData();
            this.cdr.detectChanges();
        });

        // Load trend for line chart
        this.loadTrendData();
    }

    loadTrendData() {
        this.expenseService.getTrend(this.selectedPeriod).subscribe({
            next: (data) => {
                // Clear and assign fresh array to trigger ngx-charts change detection
                this.lineData = [];
                this.lineData = [
                    {
                        name: 'Income',
                        series: data.labels.map((label, i) => ({ name: label, value: data.income[i] }))
                    },
                    {
                        name: 'Expenses',
                        series: data.labels.map((label, i) => ({ name: label, value: data.expenses[i] }))
                    }
                ];
                this.cdr.detectChanges();
            },
            error: (err) => console.error("Error loading trend data", err)
        });
    }

    updatePieData() {
        if (!this.summary.categories) return;
        this.pieData = Object.keys(this.summary.categories).map(key => ({
            name: key,
            value: this.summary.categories[key]
        }));
        this.cdr.detectChanges();
    }

    submitExpense() {
        if (this.editingExpenseId) {
            this.expenseService.updateExpense(this.editingExpenseId, this.newExpense).subscribe(() => {
                this.resetForm();
                this.loadData();
            });
        } else {
            this.expenseService.addExpense(this.newExpense).subscribe(() => {
                this.resetForm();
                this.loadData();
            });
        }
    }

    editExpense(expense: Expense) {
        this.editingExpenseId = expense.id!;
        this.newExpense = {
            ...expense,
            date: expense.date ? expense.date.substring(0, 10) : new Date().toISOString().substring(0, 10)
        };
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    deleteExpense(id: number) {
        if (confirm('Are you sure you want to delete this entry?')) {
            this.expenseService.deleteExpense(id).subscribe(() => {
                this.loadData();
            });
        }
    }

    resetForm() {
        this.editingExpenseId = null;
        this.newExpense = {
            description: '',
            amount: 0,
            type: 'expense',
            category: '',
            date: new Date().toISOString().substring(0, 10)
        };
    }

    changePeriod(period: string) {
        this.selectedPeriod = period;
        this.loadTrendData();
    }
}
