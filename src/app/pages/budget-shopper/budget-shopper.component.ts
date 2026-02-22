import { Component, OnInit } from '@angular/core';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Product {
    id: number;
    name: string;
    unit_cost: number;
    avg_monthly_sales: number;
    score?: number;
    recommended_qty?: number;
    subtotal?: number;
}

import { BudgetShopperService, OptimizedProduct } from './budget-shopper.service';

@Component({
    selector: 'app-budget-shopper',
    templateUrl: './budget-shopper.component.html',
    styleUrls: ['./budget-shopper.component.scss']
})
export class BudgetShopperComponent implements OnInit {

    budget: number = 0;
    shoppingList: OptimizedProduct[] = [];
    totalCost: number = 0;
    remainingBudget: number = 0;
    isLoading: boolean = false;
    monthsCoverage: number = 6;

    // Mock Data
    allProducts: Product[] = [
        { id: 1, name: 'Wireless Mouse', unit_cost: 450, avg_monthly_sales: 120 },
        { id: 2, name: 'Keyboard', unit_cost: 800, avg_monthly_sales: 80 },
        { id: 3, name: 'Monitor 24"', unit_cost: 12000, avg_monthly_sales: 30 },
        { id: 4, name: 'USB Cable', unit_cost: 100, avg_monthly_sales: 500 },
        { id: 5, name: 'Laptop Stand', unit_cost: 1500, avg_monthly_sales: 45 },
        { id: 6, name: 'Headphones', unit_cost: 2500, avg_monthly_sales: 60 },
        { id: 7, name: 'Webcam', unit_cost: 3000, avg_monthly_sales: 25 },
        { id: 8, name: 'Desk Lab', unit_cost: 500, avg_monthly_sales: 15 },
        { id: 9, name: 'Mouse Pad', unit_cost: 200, avg_monthly_sales: 200 },
        { id: 10, name: 'HDMI Cable', unit_cost: 300, avg_monthly_sales: 100 }
    ];

    constructor(private budgetShopperService: BudgetShopperService) { }

    ngOnInit(): void {
    }

    get formattedBudgetHelper(): string {
        if (!this.budget) return '';
        // Format to Indian numbering system (e.g., 1,00,000)
        return this.budget.toLocaleString('en-IN');
    }

    setBudget(amount: number) {
        this.budget = amount;
    }

    get monthsInWords(): string {
        const words = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
        return words[this.monthsCoverage] || this.monthsCoverage.toString();
    }

    formatLabel(value: number): string {
        return value + 'm';
    }

    generateList() {
        if (this.budget <= 0) return;

        this.isLoading = true;
        this.shoppingList = [];
        this.totalCost = 0;

        // Temporarily reset remaining budget while loading
        this.remainingBudget = this.budget;

        this.budgetShopperService.getOptimizedList(this.budget, this.monthsCoverage).subscribe({
            next: (response) => {
                if (response.status === 'success' && response.data) {
                    this.shoppingList = response.data.shopping_list;
                    this.totalCost = response.data.total_investment;
                    this.remainingBudget = response.data.remaining_budget;
                } else {
                    console.error("Optimization failed:", response.message);
                }
                this.isLoading = false;
            },
            error: (err) => {
                console.error("Error fetching optimization:", err);
                // Fallback or error handling logic here
                this.isLoading = false;
            }
        });
    }

    exportToExcel() {
        if (this.shoppingList.length === 0) return;

        // Create CSV Content
        let csvContent = "data:text/csv;charset=utf-8,";

        // Headers
        csvContent += "Product Name,Unit Cost (INR),Profit/Unit (INR),Avg Monthly Sales,EBO Score,Recommended Qty,Total Cost (INR)\n";

        // Rows
        this.shoppingList.forEach((item) => {
            const safeScore = (typeof item.score === 'number' && !isNaN(item.score)) ? item.score.toFixed(2) : '0.00';
            let row = `${item.name},${item.unit_cost},${item.unit_profit},${item.avg_monthly_sales},${safeScore},${item.recommended_qty},${item.subtotal}`;
            csvContent += row + "\n";
        });

        // Summary Rows
        csvContent += `\nTotal Investment,,,,${this.totalCost}\n`;
        csvContent += `Remaining Budget,,,,${this.remainingBudget}\n`;

        // Download
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${this.monthsCoverage}_Month_Budget_Optimization_${new Date().getTime()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    exportToPdf() {
        if (this.shoppingList.length === 0) return;

        const doc = new jsPDF();

        // --- Header Section ---
        doc.setFontSize(18);
        doc.setTextColor(63, 81, 181); // Indigo color matching theme (#3f51b5)
        doc.text(`${this.monthsCoverage}-Month Budget Optimization Report`, 14, 22);

        doc.setFontSize(10);
        doc.setTextColor(119, 119, 119); // Gray
        doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 14, 30);

        // --- Summary Section ---
        doc.setFontSize(11);
        doc.setTextColor(51, 51, 51); // Dark Gray
        doc.text(`Provided Budget: Rs. ${this.budget.toLocaleString('en-IN')}`, 14, 42);
        doc.text(`Total Investment: Rs. ${this.totalCost.toLocaleString('en-IN')}`, 14, 48);
        doc.text(`Remaining Budget: Rs. ${this.remainingBudget.toLocaleString('en-IN')}`, 110, 42); // Align right side visually
        doc.text(`Total Items: ${this.shoppingList.length}`, 110, 48);

        // --- Table Section ---
        const tableColumn = ["Product", "Cost (Rs)", "Profit (Rs)", "Avg Sales", "EBO Score", "Rec. Qty", "Total (Rs)"];
        const tableRows: any[] = [];

        this.shoppingList.forEach(item => {
            const safeScore = (typeof item.score === 'number' && !isNaN(item.score)) ? item.score.toFixed(2) : '0.00';
            const rowData = [
                item.name,
                item.unit_cost.toLocaleString('en-IN'),
                '+' + item.unit_profit.toLocaleString('en-IN'),
                item.avg_monthly_sales.toString(),
                safeScore,
                item.recommended_qty.toString(),
                item.subtotal.toLocaleString('en-IN')
            ];
            tableRows.push(rowData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 55, // Start below summary
            theme: 'striped',
            headStyles: { fillColor: [63, 81, 181], textColor: 255 }, // Indigo Header
            styles: { fontSize: 10, cellPadding: 4 },
            columnStyles: {
                0: { halign: 'left' },
                1: { halign: 'right' },
                2: { halign: 'right' },
                3: { halign: 'right' },
                4: { halign: 'center' },
                5: { halign: 'right' }
            }
        });

        // Trigger Download
        doc.save(`${this.monthsCoverage}_Month_Budget_Optimization_${new Date().getTime()}.pdf`);
    }

}
