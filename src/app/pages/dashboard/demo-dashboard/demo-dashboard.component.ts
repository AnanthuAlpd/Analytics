import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
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
  sparklineOptions?: Partial<ChartOptions>;
}

@Component({
  selector: 'app-demo-dashboard',
  templateUrl: './demo-dashboard.component.html',
  styleUrls: ['./demo-dashboard.component.scss'],
})
export class DemoDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  private destroy$ = new Subject<void>();

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
  totalForecastPieData: any[] = [];
  productList: any[] = [];
  selectedChartProductId: number | 'all' = 'all';
  selectedComparisonProductId: number | 'all' = 'all';
  selectedFutureProductId: number | 'all' = 'all'; // New filter state

  // --- Chart Data ---
  salesChartData: SalesData[] = [];
  forecastComparisonData: SalesData[] = [];
  productGrowthData: SalesData[] = [];
  top10GrowthData: SalesData[] = []; // New data for left chart
  productSummary: ForecastSummary[] = [];
  futureProjectionData: any[] = []; // Real API data for right chart

  // --- ApexCharts Options ---
  public revenueChartOptions: Partial<ChartOptions>;
  public categoryChartOptions: Partial<ChartOptions>;

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
    this.loadProductList();
    this.loadFutureProjectionData(); // Initial load for right chart

    // Initialize ApexCharts Options with defaults
    this.initRevenueChartOptions();
    this.initCategoryChartOptions();
  }

  private initRevenueChartOptions() {
    this.revenueChartOptions = {
      series: [],
      chart: {
        type: 'area',
        height: 350,
        animations: {
          enabled: true,
          speed: 800,
          animateGradually: {
            enabled: true,
            delay: 150
          },
          dynamicAnimation: {
            enabled: true,
            speed: 350
          }
        },
        toolbar: {
          show: false
        },
        parentHeightOffset: 0
      },
      colors: ['#2ecc71', '#3498db'], // Match existing revenue and profit colors (COLOR_SCHEME index 0, 1)
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth',
        width: 3
      },
      xaxis: {
        type: 'category',
        categories: [],
        labels: {
          style: {
            colors: '#9aa0ac',
          }
        },
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        }
      },
      yaxis: {
        labels: {
          formatter: (value) => {
            return value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value.toString();
          },
          style: {
            colors: '#9aa0ac',
          }
        }
      },
      legend: {
        show: false // We use custom HTML legend instead
      },
      grid: {
        borderColor: '#f1f1f1',
        strokeDashArray: 4,
        xaxis: {
          lines: {
            show: true
          }
        },
        yaxis: {
          lines: {
            show: true
          }
        },
        padding: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 10
        }
      },
      tooltip: {
        theme: 'light',
        y: {
          formatter: function (val) {
            return "₹" + val.toLocaleString();
          }
        }
      }
    };
  }

  private initCategoryChartOptions() {
    this.categoryChartOptions = {
      series: [],
      labels: [],
      chart: {
        type: 'donut',
        height: 350
      },
      colors: ['#667eea', '#f5576c', '#43e97b', '#f8b425', '#fa709a', '#30cfd0'], // Matching the dashboard's palette
      legend: {
        position: 'bottom',
        fontSize: '13px',
        markers: {
          radius: 12
        },
        itemMargin: {
          horizontal: 10,
          vertical: 5
        }
      },
      dataLabels: {
        enabled: false // Assuming we want it clean like the old doughnut chart
      },
      stroke: {
        width: 2,
        colors: ['#ffffff']
      },
      tooltip: {
        theme: 'light',
        y: {
          formatter: function (val) {
            return "₹" + val.toLocaleString();
          }
        }
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              height: 300
            },
            legend: {
              position: 'bottom'
            }
          }
        }
      ]
    };
  }

  ngAfterViewInit(): void {
    // setTimeout(() => {
    //   this.dialog.open(DemoPopupComponent, {
    //     width: '600px',
    //     height: 'auto',
    //   });
    // });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // --- Filter Handlers ---

  onFutureProjectionFilterChange(productId: any): void {
    this.selectedFutureProductId = productId;
    this.isFutureProjectionLoading = true;
    const filterId = productId === 'all' ? undefined : productId;

    this.demoDashboardService.getProductGrowthData(filterId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
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
    this.isLoading = true;
    this.errorMessage = null;
    this.demoDashboardService.getKpiDataNew()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
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
        trend: this.revenueMetrics.revenue_growth_yoy,
        sparklineOptions: this.getSparklineOptions([10, 25, 15, 30, 45, 35, 60], '#2ecc71')
      });

      cards.push({
        label: 'Gross Profit',
        value: this.revenueMetrics.gross_profit,
        isCurrency: true,
        subValue: 'Profit margin',
        icon: 'account_balance_wallet',
        iconClass: 'profit',
        cardClass: 'profit-card',
        badge: this.revenueMetrics.profit_margin,
        sparklineOptions: this.getSparklineOptions([5, 12, 8, 15, 22, 18, 30], '#3498db')
      });

      cards.push({
        label: 'Avg Order Value',
        value: this.revenueMetrics.avg_order_value,
        isCurrency: true,
        subValue: 'Per transaction',
        icon: 'shopping_cart',
        iconClass: 'aov',
        cardClass: 'aov-card',
        sparklineOptions: this.getSparklineOptions([20, 18, 25, 22, 30, 28, 35], '#f39c12')
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
        type: 'standard',
        sparklineOptions: this.getSparklineOptions([20, 35, 25, 45, 60, 50, 80], '#8e44ad') // Purple
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



  loadSalesTrend(productId?: number): void {
    this.isSalesTrendLoading = true;
    this.isSalesTrendLoading = true;
    this.demoDashboardService.getSalesTrendData(productId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
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

    this.demoDashboardService.getTopProductComparison(productId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
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
    this.demoDashboardService.getTotalProductComparison(productId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
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



  onProductFilterChange2(productId: any): void {
    const filterId = productId === 'all' ? undefined : productId;
    this.demoDashboardService.getTop10ProductGrowthData(filterId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.top10GrowthData = this.validateChartData(data);
      });
  }

  loadProductGrowthData(): void {
    this.isGrowthDataLoading = true;
    this.errorMessage = null;

    // Load standard product growth data (maybe for other purposes or if needed)
    this.demoDashboardService.getProductGrowthData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: SalesData[]) => {
          const validatedData = this.validateChartData(data);
          this.productGrowthData = validatedData;
          this.isGrowthDataLoading = false;
        },
        error: (err) => {
          console.error('Error fetching product growth data:', err);
          // this.errorMessage = err.message || 'Failed to load data'; // Don't block UI if this one fails
          this.isGrowthDataLoading = false;
        },
      });

    // Load Top 10 data for the left chart
    this.demoDashboardService.getTop10ProductGrowthData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
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

    this.demoDashboardService.getForecastSummary()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
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
    this.demoDashboardService.getRevenueMetrics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
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
    this.demoDashboardService.getCategoryPerformance()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.categoryPerformanceData = data;
        },
        error: (err) => {
          console.error('Error loading category performance:', err);
        }
      });
  }

  loadRevenueTrend(): void {
    this.demoDashboardService.getRevenueTrend(12)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.revenueTrendData = this.validateChartData(data);
          this.updateRevenueApexChartData(this.revenueTrendData);
        },
        error: (err) => {
          console.error('Error loading revenue trend:', err);
        }
      });
  }

  private updateRevenueApexChartData(ngxData: any[]) {
    // ngxData format: [{ name: 'Revenue', series: [{name: 'Jan', value: 100}, ...] }, ...]
    if (!ngxData || ngxData.length === 0) return;

    const series = [];
    let categories = [];

    ngxData.forEach((group: any) => {
      const dataPoints = [];
      const currentCategories = [];

      if (group.series) {
        group.series.forEach((point: any) => {
          dataPoints.push(point.value);
          currentCategories.push(point.name);
        });
      }

      series.push({
        name: group.name,
        data: dataPoints
      });

      // Assuming all groups share the same categories (months), grab from the first one
      if (categories.length === 0 && currentCategories.length > 0) {
        categories = currentCategories;
      }
    });

    this.revenueChartOptions.series = series;
    this.revenueChartOptions.xaxis = { ...this.revenueChartOptions.xaxis, categories: categories };
  }

  loadBusinessAlerts(): void {
    this.demoDashboardService.getBusinessAlerts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.businessAlerts = data;
        },
        error: (err) => {
          console.error('Error loading business alerts:', err);
        }
      });
  }

  loadTopPerformersData(): void {
    this.demoDashboardService.getTopPerformers(5)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.topPerformers = data;
        },
        error: (err) => {
          console.error('Error loading top performers:', err);
        }
      });
  }

  loadInventoryHealth(): void {
    this.demoDashboardService.getInventoryHealth()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.inventoryHealth = data;
        },
        error: (err) => {
          console.error('Error loading inventory health:', err);
        }
      });
  }

  loadProductList(): void {
    this.demoDashboardService.getProducts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
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