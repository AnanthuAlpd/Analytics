import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { analytics } from '../dashboard.data';
import { DashBoardService } from 'src/app/services/dashboard.service';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit {
  @ViewChild('resizedDiv') resizedDiv:ElementRef;
  public previousWidthOfResizedDiv:number = 0;
  public analytics: [] = [];

  // Chart configuration
  view: [number, number] = [1000, 500];
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = 'Month';
  showYAxisLabel = true;
  yAxisLabel = 'Revenue / Quantity';
  legendTitle = 'Legend';
  colorScheme = {
    domain: ['#5AA454', '#de1a24']
  };
  autoScale=true;
  roundDomains=true;
  combinedData: any[] = [];
  loading = true;
  error = false;
  selectedProduct: number | null = null;
selectedMonths: number | null = null;
  products: any[] = [];
  monthRanges = [
    { value: 1, label: 'Last 1 Month' },
    { value: 3, label: 'Last 3 Months' },
    { value: 6, label: 'Last 6 Months' },
    { value: 12, label: 'Last 12 Months' }
  ];

  constructor(private chartService: DashBoardService) {}

  ngOnInit() {
    this.loadChartData();
    this.loadProducts();
  }

  loadChartData() {
    this.loading = true;
    this.error = false;

    this.chartService.getLineChartAll(this.selectedProduct, this.selectedMonths).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.processChartData(response.data);
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading chart data:', err);
        this.error = true;
        this.loading = false;
      }
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


  onSelect(event: any) {
   // console.log('Item selected', event);
  }
  loadProducts() {
    this.chartService.getProducts().subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.products = response.data;
        }
      },
      error: (err) => {
        console.error('Error loading products:', err);
      }
    });
  }
  ngAfterViewChecked() {
    if(this.previousWidthOfResizedDiv != this.resizedDiv.nativeElement.clientWidth){
      //this.analytics = [...analytics];
    }
    this.previousWidthOfResizedDiv = this.resizedDiv.nativeElement.clientWidth;
  }

}
