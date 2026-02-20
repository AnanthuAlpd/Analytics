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

@Component({
    selector: 'app-budget-shopper',
    templateUrl: './budget-shopper.component.html',
    styleUrls: ['./budget-shopper.component.scss']
})
export class BudgetShopperComponent implements OnInit {

    budget: number = 0;
    shoppingList: Product[] = [];
    totalCost: number = 0;
    remainingBudget: number = 0;

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

    constructor() { }

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

    generateList() {
        this.shoppingList = [];
        this.totalCost = 0;
        let currentBudget = this.budget;

        // 1. Calculate Score (Sales Velocity / Unit Cost)
        let analyzedProducts = this.allProducts.map(p => ({
            ...p,
            score: (p.avg_monthly_sales / p.unit_cost),
            recommended_qty: 0,
            subtotal: 0
        }));

        // 2. Sort by Score Descending
        analyzedProducts.sort((a, b) => b.score - a.score);

        // 3. Greedy Allocation
        for (let product of analyzedProducts) {
            if (currentBudget <= 0) break;

            if (currentBudget >= product.unit_cost) {
                // Strategy: Try to stock for 1 month of sales
                let targetQty = Math.ceil(product.avg_monthly_sales);
                if (targetQty < 1) targetQty = 1;

                let cost = targetQty * product.unit_cost;

                if (currentBudget >= cost) {
                    product.recommended_qty = targetQty;
                    product.subtotal = cost;
                    currentBudget -= cost;
                } else {
                    let possibleQty = Math.floor(currentBudget / product.unit_cost);
                    if (possibleQty > 0) {
                        product.recommended_qty = possibleQty;
                        product.subtotal = possibleQty * product.unit_cost;
                        currentBudget -= product.subtotal;
                    }
                }

                if (product.recommended_qty > 0) {
                    this.shoppingList.push(product);
                    this.totalCost += product.subtotal;
                }
            }
        }

        this.remainingBudget = currentBudget;
    }

    exportToExcel() {
        if (this.shoppingList.length === 0) return;

        // Create CSV Content
        let csvContent = "data:text/csv;charset=utf-8,";

        // Headers
        csvContent += "Product Name,Unit Cost (INR),Avg Monthly Sales,Velocity Score,Recommended Qty,Total Cost (INR)\n";

        // Rows
        this.shoppingList.forEach((item) => {
            let row = `${item.name},${item.unit_cost},${item.avg_monthly_sales},${item.score.toFixed(2)},${item.recommended_qty},${item.subtotal}`;
            csvContent += row + "\n";
        });

        // Summary Rows
        csvContent += `\nTotal Investment,,,,${this.totalCost}\n`;
        csvContent += `Remaining Budget,,,,${this.remainingBudget}\n`;

        // Download
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Budget_Optimization_${new Date().getTime()}.csv`);
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
        doc.text("Budget Optimization Report", 14, 22);

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
        const tableColumn = ["Product", "Unit Cost (Rs)", "Avg Sales", "Score", "Rec. Qty", "Total (Rs)"];
        const tableRows: any[] = [];

        this.shoppingList.forEach(item => {
            const rowData = [
                item.name,
                item.unit_cost.toLocaleString('en-IN'),
                item.avg_monthly_sales.toString(),
                item.score.toFixed(2),
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
        doc.save(`Budget_Optimization_${new Date().getTime()}.pdf`);
    }

}
