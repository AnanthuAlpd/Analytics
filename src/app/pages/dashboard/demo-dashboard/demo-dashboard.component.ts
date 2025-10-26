import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { DatatableComponent } from '@swimlane/ngx-datatable'; // Keeping if planned for future use, but removed unused imports
import { MatDialog } from '@angular/material/dialog';
import { DemoPopupComponent } from '../demo-dashboard/demo-popup/demo-popup.component';
import { DemoDashboardService } from 'src/app/services/demo-dashboard.service';
import {
  KpiSummary,
  SalesData,
  ForecastSummary,
  COLOR_SCHEME
} from '../demo-dashboard/demo-dashboard-model';

// Keeping the interface structure as it's directly used for dashBoardDataKpi
interface DashboardDataKpi {
  kpiSummary: KpiSummary;
  trends: {
    totalProducts: string;
    totalPredictedSales: string;
    averageGrowth: string;
    totalBacklogs: string;
    predictionAccuracy: string;
  };
}

@Component({
  selector: 'app-demo-dashboard',
  templateUrl: './demo-dashboard.component.html',
  styleUrls: ['./demo-dashboard.component.scss'],
})
export class DemoDashboardComponent implements OnInit, AfterViewInit {
  // --- KPI Data Structure ---
  dashBoardDataKpi: DashboardDataKpi = {
    kpiSummary: {
      totalProducts: 0,
      totalPredictedSales: 0,
      previousActualSales: 0,
      averageGrowth: 0,
      totalBacklogs: 0,
      predictionAccuracy: 0,
    },
    trends: {
      totalProducts: '',
      totalPredictedSales: '',
      averageGrowth: '',
      totalBacklogs: '',
      predictionAccuracy: '',
    },
  };

  // --- Core Dashboard Data & Config ---

  colorScheme = COLOR_SCHEME; // Used by ngx-charts
  
  // Table configuration (used for the 'Detailed Forecast Summary' table)
  displayedColumns: string[] = [
    'product_name',
    'current_sales',
    'predicted_sales',
    'growth',
    'confidence',
    'backlogs',
  ];

  // --- Filters State ---
  selectedProduct: number | 'all' = 'all';
  selectedTimeframe = '6months';
  // Removed: selectedProductId: number | null = null; (Replaced by selectedProduct)

  // --- Chart Data ---
  salesChartData: SalesData[] = [];
  forecastComparisonData: SalesData[] = [];
  productGrowthData: SalesData[] = [];
  productSummary: ForecastSummary[] = []; // Data Source for the mat-table

  // --- Component State ---
  isLoading: boolean;
  errorMessage: any;
  // Removed: public settings: Settings; (Unused import and property)

  // Removed: @ViewChild(DatatableComponent) table: DatatableComponent; (Unused ngx-datatable dependency)

  constructor(
    // Removed: public appSettings: AppSettings, public dashBoardService: DashBoardService
    private dialog: MatDialog,
    private demoDashboardService: DemoDashboardService
  ) {
    // Removed: this.settings = this.appSettings.settings;
  }

  ngOnInit() {
    this.loadKpiData();
    this.loadSalesTrend(); // Loads sales trend for all products initially
    this.loadTopProducts();
    this.loadProductGrowthData();
    this.loadProductSummary();
  }

  ngAfterViewInit(): void {
    // Keeping the logic for the demo popup as it is active in the original code
    setTimeout(() => {
      this.dialog.open(DemoPopupComponent, {
        width: '600px',
        height: 'auto',
      });
    });
  }

  // --- Filter Handlers ---

  onProductFilterChange(productId: number | 'all') {
    this.selectedProduct = productId;
    this.applyFilters();
    this.loadSalesTrend(productId === 'all' ? undefined : productId); // Update sales trend chart
  }

  onTimeframeChange(timeframe: string) {
    this.selectedTimeframe = timeframe;
    this.applyFilters();
  }

  applyFilters() {
    // Note: For a live application, this method would trigger API calls 
    // to reload all dashboard data (KPIs, Charts, Table) based on the new filters.
    // For now, it only regenerates dummy data and the actual data loading 
    // is managed by specific methods like loadSalesTrend().
  }

  // --- KPI Trend Logic ---
  private setTrends(): void {
    const {
      totalProducts,
      totalPredictedSales,
      previousActualSales,
      averageGrowth,
      totalBacklogs,
      predictionAccuracy,
    } = this.dashBoardDataKpi.kpiSummary;

    this.dashBoardDataKpi.trends.totalProducts = `${totalProducts} products`;

    const salesTrend =
      previousActualSales > 0
        ? ((totalPredictedSales - previousActualSales) / previousActualSales) *
          100
        : 0;
    this.dashBoardDataKpi.trends.totalPredictedSales = `${
      salesTrend > 0 ? '+' : ''
    }${salesTrend.toFixed(1)}% vs last year`;

    this.dashBoardDataKpi.trends.averageGrowth = `${
      averageGrowth > 0 ? '+' : ''
    }${averageGrowth}% vs last year`;

    this.dashBoardDataKpi.trends.totalBacklogs =
      totalBacklogs === 0 ? 'No backlogs' : `${totalBacklogs} units`;

    this.dashBoardDataKpi.trends.predictionAccuracy =
      predictionAccuracy >= 80
        ? 'High confidence'
        : predictionAccuracy >= 50
        ? 'Moderate confidence'
        : 'Low confidence';
  }

  // --- Data Loading Methods ---

  private loadKpiData(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.demoDashboardService.getKpiData().subscribe({
      next: (kpiData) => {
        this.isLoading = false;
        this.dashBoardDataKpi.kpiSummary = kpiData;
        this.setTrends();
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load KPI data';
        this.isLoading = false;
      },
    });
  }

  // productId is optional, 'all' filter will pass undefined
  loadSalesTrend(productId?: number): void {
    this.isLoading = true;
    this.demoDashboardService.getSalesTrendData(productId).subscribe({
      next: (data: SalesData[]) => {
        this.salesChartData = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading sales trend:', err);
        this.isLoading = false;
      },
    });
  }

  loadTopProducts(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.demoDashboardService.getTopProductComparison().subscribe({
      next: (data: SalesData[]) => {
        this.forecastComparisonData = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching top product data:', err);
        this.errorMessage = err.message || 'Failed to load data';
        this.isLoading = false;
      },
    });
  }

  loadProductGrowthData(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.demoDashboardService.getProductGrowthData().subscribe({
      next: (data: SalesData[]) => {
        this.productGrowthData = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching product growth data:', err);
        this.errorMessage = err.message || 'Failed to load data';
        this.isLoading = false;
      },
    });
  }

  loadProductSummary(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.demoDashboardService.getForecastSummary().subscribe({
      next: (data: ForecastSummary[]) => {
        this.productSummary = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching product summary data:', err);
        this.errorMessage = err.message || 'Failed to load data';
        this.isLoading = false;
      },
    });
  }


  onSelect(event: any): void {
    console.log('Item clicked', event);
  }

}