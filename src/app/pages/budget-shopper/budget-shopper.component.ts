import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
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
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import {
    ApexAxisChartSeries,
    ApexChart,
    ApexXAxis,
    ApexYAxis,
    ApexDataLabels,
    ApexStroke,
    ApexTooltip,
    ApexLegend,
    ApexGrid,
    ApexTheme,
    ApexNonAxisChartSeries,
    ApexResponsive,
    ApexFill
} from 'ng-apexcharts';

export type ChartOptions = {
    series: ApexAxisChartSeries | ApexNonAxisChartSeries;
    chart: ApexChart;
    xaxis: ApexXAxis;
    yaxis: ApexYAxis;
    stroke: ApexStroke;
    tooltip: ApexTooltip;
    dataLabels: ApexDataLabels;
    legend: ApexLegend;
    grid: ApexGrid;
    theme: ApexTheme;
    colors: string[];
    labels: string[];
    responsive: ApexResponsive[];
    fill: ApexFill;
};

@Component({
    selector: 'app-budget-shopper',
    templateUrl: './budget-shopper.component.html',
    styleUrls: ['./budget-shopper.component.scss']
})
export class BudgetShopperComponent implements OnInit, AfterViewInit {

    budget: number = 0;
    shoppingList: OptimizedProduct[] = [];
    dataSource: MatTableDataSource<OptimizedProduct> = new MatTableDataSource<OptimizedProduct>();
    displayedColumns: string[] = ['name', 'unit_cost', 'unit_profit', 'avg_monthly_sales', 'score', 'recommended_qty', 'subtotal'];

    private _paginator!: MatPaginator;
    @ViewChild(MatPaginator) set paginator(mp: MatPaginator) {
        this._paginator = mp;
        this.dataSource.paginator = this._paginator;
    }

    private _sort!: MatSort;
    @ViewChild(MatSort) set sort(ms: MatSort) {
        this._sort = ms;
        this.dataSource.sort = this._sort;
    }
    totalCost: number = 0;
    remainingBudget: number = 0;
    isLoading: boolean = false;
    monthsCoverage: number = 6; // Live slider position
    appliedMonthsCoverage: number = 6; // Actual data in table

    // Sparkline Options
    investmentSparklineOptions: Partial<ChartOptions>;
    budgetSparklineOptions: Partial<ChartOptions>;
    itemsSparklineOptions: Partial<ChartOptions>;

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
        this.initSparklines();
    }

    private initSparklines() {
        // Initialize with default or generic data to show the trend
        this.investmentSparklineOptions = this.getSparklineOptions([10, 25, 45, 30, 60, 55, 80], '#3f51b5'); // Primary Indigo
        this.budgetSparklineOptions = this.getSparklineOptions([80, 75, 60, 65, 40, 45, 20], '#2ecc71'); // Green savings
        this.itemsSparklineOptions = this.getSparklineOptions([5, 12, 10, 25, 22, 35, 40], '#f39c12'); // Orange count 
    }

    private getSparklineOptions(data: number[], color: string): Partial<ChartOptions> {
        return {
            series: [{
                name: 'Trend',
                data: data
            }],
            chart: {
                type: 'area',
                width: 100,
                height: 35,
                sparkline: {
                    enabled: true
                }
            },
            stroke: {
                curve: 'smooth',
                width: 2
            },
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.4,
                    opacityTo: 0.05,
                    stops: [0, 100]
                }
            },
            colors: [color],
            tooltip: {
                fixed: {
                    enabled: false
                },
                x: {
                    show: false
                },
                y: {
                    title: {
                        formatter: function (seriesName) {
                            return ''
                        }
                    }
                },
                marker: {
                    show: false
                }
            }
        };
    }

    ngAfterViewInit() {
        // Assignments are now handled automatically by ViewChild setters
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
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
        return words[this.appliedMonthsCoverage] || this.appliedMonthsCoverage.toString();
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
                if (response && response.shopping_list) {
                    this.shoppingList = response.shopping_list;
                    this.dataSource.data = this.shoppingList;
                    this.totalCost = response.total_investment;
                    this.remainingBudget = response.remaining_budget;
                    this.appliedMonthsCoverage = this.monthsCoverage; // Lock in the coverage used for this math

                    // Update Sparklines with API data if available, else keep generic data
                    if (response.investment_trend) {
                        this.investmentSparklineOptions = this.getSparklineOptions(response.investment_trend, '#3f51b5');
                        this.budgetSparklineOptions = this.getSparklineOptions(response.budget_trend || [], '#2ecc71');
                        this.itemsSparklineOptions = this.getSparklineOptions(response.items_trend || [], '#f39c12');
                    }

                    // Pagination & Sorting are handled auto-magically by the ViewChild setters 
                    // once *ngIf renders the elements onto the page.
                    setTimeout(() => {
                        if (this.dataSource.paginator) {
                            this.dataSource.paginator.firstPage();
                        }
                    });
                } else {
                    console.error("Optimization failed no data returned:", response);
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
        link.setAttribute("download", `${this.appliedMonthsCoverage}_Month_Budget_Optimization_${new Date().getTime()}.csv`);
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
        doc.text(`${this.appliedMonthsCoverage}-Month Budget Optimization Report`, 14, 22);

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
        doc.save(`${this.appliedMonthsCoverage}_Month_Budget_Optimization_${new Date().getTime()}.pdf`);
    }

}
