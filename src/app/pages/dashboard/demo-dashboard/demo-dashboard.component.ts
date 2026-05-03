import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
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
        sparklineOptions: this.getSparklineOptions(this.revenueMetrics.revenue_trend || [10, 25, 15, 30, 45, 35, 60], '#2ecc71')
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
        sparklineOptions: this.getSparklineOptions(this.revenueMetrics.profit_trend || [5, 12, 8, 15, 22, 18, 30], '#3498db')
      });

      cards.push({
        label: 'Avg Order Value',
        value: this.revenueMetrics.avg_order_value,
        isCurrency: true,
        subValue: 'Per transaction',
        icon: 'shopping_cart',
        iconClass: 'aov',
        cardClass: 'aov-card',
        sparklineOptions: this.getSparklineOptions(this.revenueMetrics.aov_trend || [20, 18, 25, 22, 30, 28, 35], '#f39c12')
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
      const salesGrowth = this.kpiSummaryNew?.predictedGrowthRate || 0;
      const salesGrowthClass = salesGrowth >= 0 ? 'text-success' : 'text-danger';
      const salesGrowthIcon = salesGrowth >= 0 ? 'trending_up' : 'trending_down';

      cards.push({
        label: 'Predicted Sales',
        value: (this.kpiSummaryNew.predictedSales || 0).toLocaleString('en-IN'),
        isCurrency: false,
        subValue: 'Next month forecast',
        icon: 'insights',
        iconClass: 'prediction',
        cardClass: 'prediction-card',
        type: 'standard',
        sparklineOptions: this.getSparklineOptions(this.kpiSummaryNew?.predicted_sales_trend || [12, 18, 25, 30, 45, 60, 80], '#7209b7') // Vibrant purple
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

  private ensureArray<T>(data: any): T[] {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data.data && Array.isArray(data.data)) return data.data;
    if (data.alerts && Array.isArray(data.alerts)) return data.alerts;
    if (data.products && Array.isArray(data.products)) return data.products;
    if (typeof data === 'object') {
        // Look for any array property as a fallback
        const arrayProp = Object.values(data).find(val => Array.isArray(val));
        if (arrayProp) return arrayProp as T[];
    }
    return [];
  }

  loadBusinessAlerts(): void {
    this.demoDashboardService.getBusinessAlerts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.businessAlerts = this.ensureArray<BusinessAlert>(data);
        },
        error: (err) => {
          console.error('Error loading business alerts:', err);
          this.businessAlerts = [];
        }
      });
  }

  loadTopPerformersData(): void {
    this.demoDashboardService.getTopPerformers(5)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.topPerformers = this.ensureArray<TopPerformer>(data);
        },
        error: (err) => {
          console.error('Error loading top performers:', err);
          this.topPerformers = [];
        }
      });
  }

  loadInventoryHealth(): void {
    this.demoDashboardService.getInventoryHealth()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          // Handle wrapped response: { status: 'success', data: { ... } }
          const data = response && response.data ? response.data : response;
          this.inventoryHealth = data;
          
          // Ensure nested arrays are safe for template iteration
          if (this.inventoryHealth) {
            this.inventoryHealth.at_risk_products = this.ensureArray(this.inventoryHealth.at_risk_products);
          }
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
          this.productList = this.ensureArray<any>(products);
        },
        error: (err) => {
          console.error('Error loading product list:', err);
          this.productList = [];
        }
      });
  }

  onSelect(event: any): void {
    console.log('Item clicked', event);
  }

  exportToPdf(): void {
    const doc = new jsPDF();
    const timestamp = new Date().getTime();
    const dateStr = new Date().toLocaleDateString();
    const timeStr = new Date().toLocaleTimeString();

    // --- 1. PROFESSIONAL HEADER ---
    doc.setFontSize(22);
    doc.setTextColor(63, 81, 181); // Primary Indigo
    doc.text('Business Analytics Executive Report', 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${dateStr} at ${timeStr}`, 14, 30);
    doc.text('Confidential Intelligence Report', 14, 35);
    
    // Draw a divider line
    doc.setDrawColor(230, 230, 230);
    doc.line(14, 40, 196, 40);

    let currentY = 50;

    // --- 2. EXECUTIVE KPI SUMMARY ---
    doc.setFontSize(14);
    doc.setTextColor(40);
    doc.text('Executive Summary', 14, currentY);
    currentY += 10;

    const kpiRows = this.kpiCards.map(card => [
        card.label,
        card.isCurrency ? `Rs. ${Number(card.value).toLocaleString('en-IN')}` : card.value.toString(),
        card.trend ? `${card.trend > 0 ? '+' : ''}${card.trend}%` : (card.badge ? `${card.badge}%` : '-')
    ]);

    autoTable(doc, {
        head: [['Metric', 'Value', 'Performance']],
        body: kpiRows,
        startY: currentY,
        theme: 'grid',
        headStyles: { fillColor: [63, 81, 181], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 4 },
        columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' } }
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;

    // --- 3. FORECAST INTELLIGENCE ---
    doc.setFontSize(14);
    doc.setTextColor(40);
    doc.text('Forecast Intelligence', 14, currentY);
    currentY += 10;

    const forecastRows = this.forecastCards.map(card => [
        card.label,
        card.value.toString(),
        card.subValue || (card.badge ? card.badge.toString() : '-')
    ]);

    autoTable(doc, {
        head: [['AI Prediction Metric', 'Estimated Value', 'Status/Trend']],
        body: forecastRows,
        startY: currentY,
        theme: 'striped',
        headStyles: { fillColor: [114, 9, 183], textColor: 255 }, // Vibrant Purple for AI
        styles: { fontSize: 10, cellPadding: 4 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;

    // --- 4. TOP PERFORMING PRODUCTS ---
    doc.setFontSize(14);
    doc.setTextColor(40);
    doc.text('Top Performing Products', 14, currentY);
    currentY += 10;

    const topPerformerRows = this.topPerformers.map((item, index) => [
        `#${index + 1}`,
        item.product_name,
        item.units_sold.toLocaleString(),
        `Rs. ${item.revenue.toLocaleString('en-IN')}`
    ]);

    autoTable(doc, {
        head: [['Rank', 'Product Name', 'Units Sold', 'Revenue (INR)']],
        body: topPerformerRows,
        startY: currentY,
        theme: 'grid',
        headStyles: { fillColor: [243, 156, 18], textColor: 255 }, // Amber for performers
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: { 2: { halign: 'right' }, 3: { halign: 'right' } }
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;

    // --- 5. INVENTORY HEALTH ---
    if (this.inventoryHealth) {
        // Start a new page if we're near the bottom
        if (currentY > 230) {
            doc.addPage();
            currentY = 20;
        }

        doc.setFontSize(14);
        doc.setTextColor(40);
        doc.text('Inventory Health & Risk Analysis', 14, currentY);
        currentY += 8;

        doc.setFontSize(10);
        if (this.inventoryHealth.status === 'Healthy') {
            doc.setTextColor(46, 204, 113); // Green
        } else {
            doc.setTextColor(231, 76, 60); // Red
        }
        doc.text(`Overall Status: ${this.inventoryHealth.status.toUpperCase()}`, 14, currentY);
        currentY += 5;

        doc.setTextColor(80);
        doc.text(`Total Stock Value (Cost): Rs. ${this.inventoryHealth.total_inventory_value_cost.toLocaleString('en-IN')}`, 14, currentY);
        currentY += 5;
        doc.text(`Estimated Sale Value: Rs. ${this.inventoryHealth.total_inventory_value_sale.toLocaleString('en-IN')}`, 14, currentY);
        currentY += 10;

        if (this.inventoryHealth.at_risk_products && this.inventoryHealth.at_risk_products.length > 0) {
            const riskRows = this.inventoryHealth.at_risk_products.map(p => [p.name, p.stock.toString()]);
            autoTable(doc, {
                head: [['At-Risk Product (Low Stock)', 'Stock Remaining']],
                body: riskRows,
                startY: currentY,
                theme: 'plain',
                headStyles: { fillColor: [231, 76, 60], textColor: 255 },
                styles: { fontSize: 9, cellPadding: 2 }
            });
        }
    }

    // --- FOOTER ---
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Page ${i} of ${pageCount}`, 196, 285, { align: 'right' });
        doc.text('Powered by Prabhas Analytics AI Engine', 14, 285);
    }

    // TRIGGER DOWNLOAD
    doc.save(`Prabhas_Analytics_Report_${timestamp}.pdf`);
  }

}