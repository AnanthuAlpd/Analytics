import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { MatDialog } from '@angular/material/dialog';
import { DemoPopupComponent } from '../demo-dashboard/demo-popup/demo-popup.component';
import { DemoDashboardService } from 'src/app/services/demo-dashboard.service';
import {
  KpiSummary,
  KpiSummaryNew,
  SalesData,
  ForecastSummary,
  COLOR_SCHEME,
  FORECAST_COLOR_SCHEME,
  GROWTH_COLOR_SCHEME,
  RevenueMetrics,
  CategoryPerformance,
  BusinessAlert,
  TopPerformer,
  InventoryHealth
} from '../demo-dashboard/demo-dashboard-model';

export interface KpiCard {
  label: string;
  value: number | string;
  isCurrency: boolean;
  subValue: string;
  icon: string;
  iconClass: string;
  cardClass: string;
  type?: 'standard' | 'split' | 'progress' | 'alert' | 'custom';
  trend?: number;
  badge?: number | string;
  badgeIcon?: string;
  badgeClass?: string;
  progress?: number;
  progressClass?: string;
  splitData?: {
    label: string;
    value: any;
    class: string;
  }[];
  footer?: {
    icon: string;
    value: any;
    class: string;
  };
  alertType?: 'warning' | 'success';
}

@Component({
  selector: 'app-demo-dashboard',
  templateUrl: './demo-dashboard.component.html',
  styleUrls: ['./demo-dashboard.component.scss'],
})
export class DemoDashboardComponent implements OnInit, AfterViewInit {

  // --- Core Dashboard Data & Config ---

  colorScheme = COLOR_SCHEME;
  forecastColorScheme = FORECAST_COLOR_SCHEME;
  growthColorScheme = GROWTH_COLOR_SCHEME;

  // Table configuration
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
  totalComparisonData: any[]
  combinedData: any[] = [];
  totalForecastPieData: any[] = [];
  productList: any[] = [];
  selectedChartProductId: number | 'all' = 'all';
  selectedComparisonProductId: number | 'all' = 'all';
  selectedFutureProductId: number | 'all' = 'all'; // New filter state

  // --- Chart Data ---
  salesChartData: SalesData[] = [];
  forecastComparisonData: SalesData[] = [];
  productGrowthData: SalesData[] = [];
  productGrowthDataOne: SalesData[] = []; // Used for old logic if needed, but we'll use top10GrowthData for left chart
  top10GrowthData: SalesData[] = []; // New data for left chart
  productSummary: ForecastSummary[] = [];
  futureProjectionData: any[] = []; // Real API data for right chart

  // --- Card Data Properties ---
  kpiCards: KpiCard[] = [];
  forecastCards: KpiCard[] = [];

  // --- Component State ---
  isLoading: boolean;
  isSalesTrendLoading: boolean = false;
  isComparisonLoading: boolean = false;
  isTotalComparisonLoading: boolean = false;
  isFutureProjectionLoading: boolean = false; // New loading state
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

  constructor(
    private dialog: MatDialog,
    private demoDashboardService: DemoDashboardService
  ) { }

  ngOnInit() {
    this.salesChartData = [];
    this.forecastComparisonData = [];
    this.productGrowthData = [];
    this.productGrowthDataOne = [];
    this.top10GrowthData = [];
    this.revenueTrendData = [];

    // Mock data for the placeholder chart
    // Initialize real data for right chart
    this.futureProjectionData = [];

    this.loadKpiDataNew();
    this.loadTotalComparison();
    this.loadSalesTrend();
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
    this.loadInventoryHealth();
    this.loadProductList();
    this.loadFutureProjectionData(); // Initial load for right chart
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.dialog.open(DemoPopupComponent, {
        width: '600px',
        height: 'auto',
      });
    });
  }

  // --- Filter Handlers ---

  onFutureProjectionFilterChange(productId: any): void {
    this.selectedFutureProductId = productId;
    this.isFutureProjectionLoading = true;
    const filterId = productId === 'all' ? undefined : productId;

    this.demoDashboardService.getProductGrowthData(filterId).subscribe({
      next: (data) => {
        this.futureProjectionData = this.validateChartData(data);
        this.isFutureProjectionLoading = false;
      },
      error: (err) => {
        console.error('Error loading future projection:', err);
        this.isFutureProjectionLoading = false;
      }
    });
  }

  loadFutureProjectionData() {
    this.onFutureProjectionFilterChange('all');
  }

  validateChartData(data: any[], defaultSeriesName: string = 'Overview'): any[] {
    if (!data || !Array.isArray(data)) return [];

    // Check if it's already MultiSeries (checking first item is usually enough)
    const isMultiSeries = data.length > 0 && data[0].hasOwnProperty('series');
    if (isMultiSeries) {
      return data.filter(item => item && Array.isArray(item.series));
    }

    // Check if it's SingleSeries (has value) and wrap it
    const isSingleSeries = data.length > 0 && data[0].hasOwnProperty('value');
    if (isSingleSeries) {
      return [{
        name: defaultSeriesName,
        series: data
      }];
    }

    return [];
  }

  onProductFilterChange(productId: any): void {
    this.selectedChartProductId = productId;
    const filterId = productId === 'all' ? undefined : productId;
    this.loadSalesTrend(filterId);
  }

  onComparisonProductFilterChange(productId: any): void {
    this.selectedComparisonProductId = productId;
    const filterId = productId === 'all' ? undefined : productId;
    // this.loadTopProducts(filterId); // Keep Left Chart static
    this.loadTotalComparison(filterId);
  }

  onTimeframeChange(timeframe: string) {
    this.selectedTimeframe = timeframe;
    this.applyFilters();
  }

  applyFilters() {
    // Trigger data reload based on filters
  }

  private loadKpiDataNew(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.demoDashboardService.getKpiDataNew().subscribe({
      next: (kpiData) => {
        this.isLoading = false;
        this.kpiSummaryNew = kpiData;
        console.log(this.kpiSummaryNew);
        this.updateKpiCards();
        this.updateForecastCards();
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load KPI data';
        this.isLoading = false;
      },
    });
  }

  updateKpiCards() {
    const cards: KpiCard[] = [];

    if (this.revenueMetrics) {
      cards.push({
        label: 'Total Revenue',
        value: this.revenueMetrics.total_revenue,
        isCurrency: true,
        subValue: `${this.revenueMetrics.total_units_sold ? this.revenueMetrics.total_units_sold.toLocaleString() : '0'} units`,
        icon: 'payments',
        iconClass: 'revenue',
        cardClass: 'revenue-card',
        trend: this.revenueMetrics.revenue_growth_yoy
      });

      cards.push({
        label: 'Gross Profit',
        value: this.revenueMetrics.gross_profit,
        isCurrency: true,
        subValue: 'Profit margin',
        icon: 'account_balance_wallet',
        iconClass: 'profit',
        cardClass: 'profit-card',
        badge: this.revenueMetrics.profit_margin
      });

      cards.push({
        label: 'Avg Order Value',
        value: this.revenueMetrics.avg_order_value,
        isCurrency: true,
        subValue: 'Per transaction',
        icon: 'shopping_cart',
        iconClass: 'aov',
        cardClass: 'aov-card'
      });
    }

    if (this.kpiSummaryNew) {
      cards.push({
        label: 'Total Products',
        value: this.kpiSummaryNew.totalProducts,
        isCurrency: false,
        subValue: 'In catalog',
        icon: 'inventory_2',
        iconClass: 'products',
        cardClass: 'products-card'
      });
    }

    this.kpiCards = cards;
  }

  updateForecastCards() {
    const cards: KpiCard[] = [];
    if (this.kpiSummaryNew) {
      // Predicted Sales
      cards.push({
        label: 'Predicted Sales',
        value: (this.kpiSummaryNew.predictedSales || 0).toLocaleString('en-IN'),
        isCurrency: false,
        subValue: 'Next month forecast',
        icon: 'insights',
        iconClass: 'prediction',
        cardClass: 'prediction-card',
        type: 'standard'
      });

      // Growth Rate
      const growthRate = this.kpiSummaryNew.growthRate || 0;
      cards.push({
        label: 'Growth Rate',
        value: `${growthRate.toFixed(1)}%`,
        isCurrency: false,
        subValue: 'Month-over-month',
        icon: 'trending_up',
        iconClass: 'growth',
        cardClass: 'growth-card',
        type: 'split',
        splitData: [
          {
            label: 'Current',
            value: (this.kpiSummaryNew.currentMonthSales || 0).toLocaleString('en-IN'),
            class: ''
          },
          {
            label: 'Predicted',
            value: (this.kpiSummaryNew.predictedSales || 0).toLocaleString('en-IN'),
            class: growthRate > 0 ? 'positive-text' : 'negative-text'
          }
        ]
      });

      // Prediction Accuracy
      const accuracy = this.kpiSummaryNew.predictionAccuracy;
      let accuracyStatus = 'Poor';
      let accuracyClass = 'poor';
      if (accuracy >= 90) { accuracyStatus = 'Excellent'; accuracyClass = 'excellent'; }
      else if (accuracy >= 75) { accuracyStatus = 'Good'; accuracyClass = 'good'; }
      else if (accuracy >= 60) { accuracyStatus = 'Fair'; accuracyClass = 'fair'; }

      cards.push({
        label: 'Model Accuracy',
        value: `${accuracy.toFixed(1)}%`,
        isCurrency: false,
        subValue: '',
        icon: 'psychology',
        iconClass: 'accuracy',
        cardClass: 'accuracy-card',
        type: 'progress',
        progress: accuracy,
        badge: accuracyStatus,
        badgeClass: `status-badge-compact ${accuracyClass}`
      });

      // Backorder Alert
      const backorders = this.kpiSummaryNew.monthly_avg_backorder;
      const isSafe = backorders === 0;
      cards.push({
        label: 'Avg Backorder',
        value: backorders,
        isCurrency: false,
        subValue: isSafe ? 'All clear' : 'Action needed',
        icon: isSafe ? 'check_circle' : 'error_outline',
        iconClass: `backorder ${isSafe ? 'success' : 'warning'}`,
        cardClass: `backorder-card ${isSafe ? 'healthy-state' : 'alert-state'}`,
        type: 'alert',
        alertType: isSafe ? 'success' : 'warning',
        badgeIcon: isSafe ? 'check' : 'warning',
        badgeClass: isSafe ? 'success-badge-compact' : 'alert-badge-compact',
        progressClass: isSafe ? 'success-text' : 'warning-text'
      });
    }
    this.forecastCards = cards;
  }

  processChartData(data: any) {
    const actualSeries = data.actual.map((item: any) => ({
      name: item.month,
      value: item.total_quantity_sold,
      type: item.type,
      extra: { isActual: true }
    }));

    const predictedSeries = data.predicted.map((item: any) => ({
      name: item.month,
      value: item.forecasted_quantity,
      type: item.type,
      models: item.models,
      extra: { isActual: false }
    }));

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

  loadSalesTrend(productId?: number): void {
    this.isSalesTrendLoading = true;
    this.demoDashboardService.getSalesTrendData(productId).subscribe({
      next: (data: SalesData[]) => {
        this.salesChartData = this.validateChartData(data);
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
        this.forecastComparisonData = this.validateChartData(data);
        this.isComparisonLoading = false;
      },
      error: (err) => {
        console.error('Error fetching top product data:', err);
        this.errorMessage = err.message || 'Failed to load data';
        this.isComparisonLoading = false;
      },
    });
  }

  processToSingleSeries(data: any[]): any[] {
    if (!data || !Array.isArray(data)) return [];

    const isMultiSeries = data.length > 0 && data[0].hasOwnProperty('series');
    if (isMultiSeries) {
      // Aggregate multi-series into single series (sum of values)
      return data.map(group => ({
        name: group.name,
        value: group.series.reduce((sum, item) => sum + (item.value || 0), 0)
      }));
    }

    // Single series, use as is
    return data;
  }

  loadTotalComparison(productId?: number) {
    this.isTotalComparisonLoading = true; // Use separate flag
    this.errorMessage = null;
    this.demoDashboardService.getTotalProductComparison(productId).subscribe({
      next: (data: any[]) => {
        this.totalComparisonData = this.validateChartData(data);
        // Process for Doughnut Chart
        this.totalForecastPieData = this.processToSingleSeries(data);
        this.isTotalComparisonLoading = false;
      },
      error: (err) => {
        console.error('Error fetching top product data:', err);
        this.errorMessage = err.message || 'Failed to load data';
        this.isTotalComparisonLoading = false;
      },
    });
  }

  onProductFilterChange1(productId) {
    this.selectedChartProductId = productId;
    const filterId = productId === 'all' ? undefined : productId;
    this.demoDashboardService.getTotalProductComparison(filterId).subscribe((data: any[]) => {
      this.totalComparisonData = this.validateChartData(data);
      this.totalForecastPieData = this.processToSingleSeries(data);
    });
  }

  onProductFilterChange2(productId: any): void {
    const filterId = productId === 'all' ? undefined : productId;
    this.demoDashboardService.getTop10ProductGrowthData(filterId).subscribe((data) => {
      this.top10GrowthData = this.validateChartData(data);
    });
  }

  loadProductGrowthData(): void {
    this.isGrowthDataLoading = true;
    this.errorMessage = null;

    // Load standard product growth data (maybe for other purposes or if needed)
    this.demoDashboardService.getProductGrowthData().subscribe({
      next: (data: SalesData[]) => {
        const validatedData = this.validateChartData(data);
        this.productGrowthData = validatedData;
        this.productGrowthDataOne = validatedData; // Keep legacy populated just in case
        this.isGrowthDataLoading = false;
      },
      error: (err) => {
        console.error('Error fetching product growth data:', err);
        // this.errorMessage = err.message || 'Failed to load data'; // Don't block UI if this one fails
        this.isGrowthDataLoading = false;
      },
    });

    // Load Top 10 data for the left chart
    this.demoDashboardService.getTop10ProductGrowthData().subscribe({
      next: (data: SalesData[]) => {
        this.top10GrowthData = this.validateChartData(data);
      },
      error: (err) => {
        console.error('Error fetching top 10 product growth data:', err);
      }
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
        this.updateKpiCards();
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
        this.revenueTrendData = this.validateChartData(data);
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