import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { DatatableComponent } from '@swimlane/ngx-datatable'; // Keeping if planned for future use, but removed unused imports
import { MatDialog } from '@angular/material/dialog';
import { DemoPopupComponent } from '../demo-dashboard/demo-popup/demo-popup.component';
import { DemoDashboardService } from 'src/app/services/demo-dashboard.service';
import {
  KpiSummary,
  KpiSummaryNew,
  SalesData,
  ForecastSummary,
  COLOR_SCHEME,
  RevenueMetrics,
  CategoryPerformance,
  BusinessAlert,
  TopPerformer,
  InventoryHealth
} from '../demo-dashboard/demo-dashboard-model';



@Component({
  selector: 'app-demo-dashboard',
  templateUrl: './demo-dashboard.component.html',
  styleUrls: ['./demo-dashboard.component.scss'],
})
export class DemoDashboardComponent implements OnInit, AfterViewInit {


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
  totalComparisonData: any[]
  combinedData: any[] = [];
  productList: any[] = [];
  selectedChartProductId: number | 'all' = 'all';
  selectedComparisonProductId: number | 'all' = 'all';
  // --- Chart Data ---
  salesChartData: SalesData[] = [];
  forecastComparisonData: SalesData[] = [];
  productGrowthData: SalesData[] = [];
  productSummary: ForecastSummary[] = []; // Data Source for the mat-table

  // --- Component State ---
  isLoading: boolean; // General loading (e.g. for initial load or full refresh)
  isSalesTrendLoading: boolean = false;
  isComparisonLoading: boolean = false;
  isGrowthDataLoading: boolean = false;
  isSummaryLoading: boolean = false;

  errorMessage: any;
  kpiSummaryNew: KpiSummaryNew;

  // --- Enhanced Business Analytics Data ---
  revenueMetrics: RevenueMetrics;
  categoryPerformanceData: CategoryPerformance[] = [];
  revenueTrendData: SalesData[] = [];
  businessAlerts: BusinessAlert[] = [];
  topPerformers: TopPerformer[] = [];
  inventoryHealth: InventoryHealth;

  // Removed: @ViewChild(DatatableComponent) table: DatatableComponent; (Unused ngx-datatable dependency)

  constructor(
    // Removed: public appSettings: AppSettings, public dashBoardService: DashBoardService
    private dialog: MatDialog,
    private demoDashboardService: DemoDashboardService
  ) {
    // Removed: this.settings = this.appSettings.settings;
  }

  ngOnInit() {
    // this.loadKpiData();
    this.loadKpiDataNew();
    this.loadTotalComparison();
    this.loadSalesTrend(); // Loads sales trend for all products initially
    this.loadTopProducts();
    this.loadProductGrowthData();
    this.loadProductSummary();

    // Load enhanced business analytics
    this.loadRevenueMetrics();
    this.loadCategoryPerformance();
    this.loadRevenueTrend();
    this.loadBusinessAlerts();
    this.loadTopPerformersData();
    this.loadInventoryHealth();
    this.loadProductList();
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

  onProductFilterChange(productId: any): void {
    this.selectedChartProductId = productId;
    const filterId = productId === 'all' ? undefined : productId;
    this.loadSalesTrend(filterId);
  }

  onComparisonProductFilterChange(productId: any): void {
    this.selectedComparisonProductId = productId;
    const filterId = productId === 'all' ? undefined : productId;
    this.loadTopProducts(filterId);
    this.loadTotalComparison(filterId);
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


  private loadKpiDataNew(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.demoDashboardService.getKpiDataNew().subscribe({
      next: (kpiData) => {
        this.isLoading = false;
        this.kpiSummaryNew = kpiData;
        console.log(this.kpiSummaryNew);
        //this.setTrends();
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load KPI data';
        this.isLoading = false;
      },
    });
  }

  processChartData(data: any) {
    // Process actual data
    const actualSeries = data.actual.map((item: any) => ({
      name: item.month,
      value: item.total_quantity_sold,
      type: item.type,
      extra: { isActual: true }
    }));

    // Process predicted data
    const predictedSeries = data.predicted.map((item: any) => ({
      name: item.month,
      value: item.forecasted_quantity,
      type: item.type,
      models: item.models,
      extra: { isActual: false }
    }));

    // Combine data for the chart
    this.combinedData = [
      {
        name: 'Actual Qty Sold',
        series: actualSeries
      },
      {
        name: 'Predicted Qty',
        series: predictedSeries
      }
    ];
  }

  // productId is optional, 'all' filter will pass undefined
  loadSalesTrend(productId?: number): void {
    this.isSalesTrendLoading = true;
    this.demoDashboardService.getSalesTrendData(productId).subscribe({
      next: (data: SalesData[]) => {
        this.salesChartData = data;
        this.isSalesTrendLoading = false;
      },
      error: (err) => {
        console.error('Error loading sales trend:', err);
        this.isSalesTrendLoading = false;
      },
    });
  }

  loadTopProducts(productId?: number): void {
    this.isComparisonLoading = true;
    this.errorMessage = null;

    this.demoDashboardService.getTopProductComparison(productId).subscribe({
      next: (data: SalesData[]) => {
        this.forecastComparisonData = data;
        this.isComparisonLoading = false;
      },
      error: (err) => {
        console.error('Error fetching top product data:', err);
        this.errorMessage = err.message || 'Failed to load data';
        this.isComparisonLoading = false;
      },
    });
  }

  loadTotalComparison(productId?: number) {
    this.isComparisonLoading = true;
    this.errorMessage = null;

    this.demoDashboardService.getTotalProductComparison(productId).subscribe({
      next: (data: any[]) => {
        this.totalComparisonData = data;
        this.isComparisonLoading = false;
      },
      error: (err) => {
        console.error('Error fetching top product data:', err);
        this.errorMessage = err.message || 'Failed to load data';
        this.isComparisonLoading = false;
      },
    });

  }

  loadProductGrowthData(): void {
    this.isGrowthDataLoading = true;
    this.errorMessage = null;

    this.demoDashboardService.getProductGrowthData().subscribe({
      next: (data: SalesData[]) => {
        this.productGrowthData = data;
        this.isGrowthDataLoading = false;
      },
      error: (err) => {
        console.error('Error fetching product growth data:', err);
        this.errorMessage = err.message || 'Failed to load data';
        this.isGrowthDataLoading = false;
      },
    });
  }

  loadProductSummary(): void {
    this.isSummaryLoading = true;
    this.errorMessage = null;

    this.demoDashboardService.getForecastSummary().subscribe({
      next: (data: ForecastSummary[]) => {
        this.productSummary = data;
        this.isSummaryLoading = false;
      },
      error: (err) => {
        console.error('Error fetching product summary data:', err);
        this.errorMessage = err.message || 'Failed to load data';
        this.isSummaryLoading = false;
      },
    });
  }

  // ===== Enhanced Business Analytics Methods =====

  loadRevenueMetrics(): void {
    this.demoDashboardService.getRevenueMetrics().subscribe({
      next: (data) => {
        this.revenueMetrics = data;
      },
      error: (err) => {
        console.error('Error loading revenue metrics:', err);
      }
    });
  }

  loadCategoryPerformance(): void {
    this.demoDashboardService.getCategoryPerformance().subscribe({
      next: (data) => {
        this.categoryPerformanceData = data;
      },
      error: (err) => {
        console.error('Error loading category performance:', err);
      }
    });
  }

  loadRevenueTrend(): void {
    this.demoDashboardService.getRevenueTrend(12).subscribe({
      next: (data) => {
        this.revenueTrendData = data;
      },
      error: (err) => {
        console.error('Error loading revenue trend:', err);
      }
    });
  }

  loadBusinessAlerts(): void {
    this.demoDashboardService.getBusinessAlerts().subscribe({
      next: (data) => {
        this.businessAlerts = data;
      },
      error: (err) => {
        console.error('Error loading business alerts:', err);
      }
    });
  }

  loadTopPerformersData(): void {
    this.demoDashboardService.getTopPerformers(5).subscribe({
      next: (data) => {
        this.topPerformers = data;
      },
      error: (err) => {
        console.error('Error loading top performers:', err);
      }
    });
  }

  loadInventoryHealth(): void {
    this.demoDashboardService.getInventoryHealth().subscribe({
      next: (data) => {
        this.inventoryHealth = data;
      },
      error: (err) => {
        console.error('Error loading inventory health:', err);
      }
    });
  }

  loadProductList(): void {
    this.demoDashboardService.getProducts().subscribe({
      next: (products) => {
        this.productList = products;
      },
      error: (err) => {
        console.error('Error loading product list:', err);
      }
    });
  }

  onSelect(event: any): void {
    console.log('Item clicked', event);
  }

}