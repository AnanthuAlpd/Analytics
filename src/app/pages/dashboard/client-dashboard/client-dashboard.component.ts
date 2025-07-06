import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AppSettings } from 'src/app/app.settings';
import { Settings } from 'src/app/app.settings.model';
import { DashBoardService } from 'src/app/services/dashboard.service';

@Component({
  selector: 'app-client-dashboard',
  templateUrl: './client-dashboard.component.html',
  styleUrls: ['./client-dashboard.component.scss']
})
export class ClientDashboardComponent implements OnInit {
  public settings: Settings;

  // KPI card values
  totalRevenue: number = 0;
  highestSellingProduct: string = '';
  topRevenueProductLabel: string = '';
  topRevenueValue: number = 0;

  // Bar chart data
  topSellingProducts: any[] = [];
  topRevenueProducts: any[] = [];
  colorScheme = {
    domain: ['#3f51b5', '#e91e63', '#00acc1', '#4caf50', '#ff9800', '#9c27b0', '#607d8b', '#ff5722', '#795548', '#8bc34a']
  };
  leastSellingProducts: any[] = [];
  topSellingLoaded = false;
  topRevenueLoaded = false;
  unsoldProducts: any[] = [];
  topRatedProducts: any[] = [];

  constructor(
    private cd: ChangeDetectorRef,
    public appSettings: AppSettings,
    private dashBoardService: DashBoardService
  ) {
    this.settings = this.appSettings.settings;
  }

  ngOnInit(): void {
    this.loadKpiCardData();
    this.loadTopSellingProductsChart();
    this.loadTopRevenueProductsChart();
    this.loadTables();
  }

  // Load KPI card data from API
  private loadKpiCardData(): void {
    this.dashBoardService.getClientKpiCard().subscribe(res => {
      this.totalRevenue = res.total_sales_value || 0;

      if (res.highest_selling_product) {
        const p = res.highest_selling_product;
        this.highestSellingProduct = `${p.name} (${p.hsn}) - ${p.units_sold} units`;
      } else {
        this.highestSellingProduct = 'N/A';
      }

      if (res.top_revenue_product) {
        const p = res.top_revenue_product;
        this.topRevenueProductLabel = `${p.name} (${p.hsn})`;
        this.topRevenueValue = p.revenue || 0;
      } else {
        this.topRevenueProductLabel = 'N/A';
        this.topRevenueValue = 0;
      }
    });
  }

  private loadTopSellingProductsChart(): void {
    this.dashBoardService.getClientTopTenProductsChart().subscribe(res => {
      this.topSellingProducts = res || [];
      this.topSellingLoaded = true;
      this.cd.detectChanges();  // run after data set
    });
  }
  
  private loadTopRevenueProductsChart(): void {
    this.dashBoardService.getClientTopRevenueProductsChart().subscribe(res => {
      this.topRevenueProducts = res || [];
      this.topRevenueLoaded = true;
      this.cd.detectChanges();  // run after data set
    });
  }
  private loadTables(): void {
    this.dashBoardService.getLeastSellingProducts().subscribe(res => {
      this.leastSellingProducts = res || [];
    });

    this.dashBoardService.getUnsoldProducts().subscribe(res => {
      this.unsoldProducts = res || [];
    });

    this.dashBoardService.getTopRateProducts().subscribe(res => {
      this.topRatedProducts = res || [];
    })
  }

  
}


