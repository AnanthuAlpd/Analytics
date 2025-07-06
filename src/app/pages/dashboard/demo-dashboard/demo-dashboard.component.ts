import { Component, OnInit, ViewChild } from '@angular/core';
import { AppSettings } from 'src/app/app.settings';
import { Settings } from 'src/app/app.settings.model';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { DashBoardService } from 'src/app/services/dashboard.service';
import { DemoPopupComponent } from '../demo-dashboard/demo-popup/demo-popup.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-demo-dashboard',
  templateUrl: './demo-dashboard.component.html',
  styleUrls: ['./demo-dashboard.component.scss']
})
export class DemoDashboardComponent implements OnInit {
  @ViewChild(DatatableComponent) table: DatatableComponent;

  public settings: Settings;

  constructor(public appSettings: AppSettings,
    public dashBoardService: DashBoardService,private dialog: MatDialog) {
    this.settings = this.appSettings.settings;
  }

  salesData: any[] = [];      // Full original data
  filteredData: any[] = [];   // Filtered data for table
  searchTerm: string = '';
  pageSize = 6;

  columns = [
    { prop: 'product_name', name: 'Product Name' },
    { prop: 'actual_sale_2022', name: 'Actual Qty Sold 2022' },
    { prop: 'predicted_sale_2023', name: 'Predicted Qty - 2023' }
  ];
// Example data for ngx-charts
chartData = [];
public showXAxis = true;
  public showYAxis = true;
  public gradient = false;
  public showLegend = false;
  public showXAxisLabel = true;
  public xAxisLabel = '';
  public showYAxisLabel = true;
  public yAxisLabel = '';
  public colorScheme = {
    domain: ['#2F3E9E', '#D22E2E', '#378D3B', '#0096A6', '#F47B00', '#606060']
  };
highestSellingProduct:any;
mostValuableProduct:any;
totalRevenue:any;


  ngOnInit() {
    this.fetchSalesData();
    this.getRevenueChart();
    this.fetchCardData();

  }

ngAfterViewInit(): void {
    // You may use a setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      this.dialog.open(DemoPopupComponent, {
        width: '600px',
        height: 'auto'
      });
    });
  }

  fetchCardData(){
    this.dashBoardService.getLineChartAll().subscribe(res=>{
      this.totalRevenue = res.data.total_revenue[0].total_forecasted_value;
      this.highestSellingProduct=res.data.max_qty[0].product_name;
      this.mostValuableProduct=res.data.valuable_product[0].product_name

    })
  }


  fetchSalesData() {
    this.dashBoardService.getDataTable()
      .subscribe(
        response => {
          if (response.status === 'success') {
            this.salesData = response.data;
            this.filteredData = [...this.salesData]; // Start with all data
          } else {
            console.error('Error fetching data');
          }
        },
        error => {
          console.error('Error fetching sales data:', error);
        }
      );
  }

  onFilterChange(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredData = this.salesData.filter(row =>
      (row.product_name || '').toLowerCase().includes(term)
    );
  }

  onSort(event: any): void {
    const sort = event.sorts[0];
    const prop = sort.prop;
    const dir = sort.dir === 'asc' ? 1 : -1;
    this.filteredData.sort((a, b) => {
      if ((a[prop] || '') < (b[prop] || '')) return -1 * dir;
      if ((a[prop] || '') > (b[prop] || '')) return 1 * dir;
      return 0;
    });
  }

  getRevenueChart(){
    this.dashBoardService.getRevenueChart().subscribe(res=>{
      this.chartData=res.data;
    })
  }
  public onSelect(event) {
    console.log(event);
  }
}
