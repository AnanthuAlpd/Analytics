import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AppSettings } from '../../app.settings';
import { Settings } from '../../app.settings.model';
import { EntityListEmpClientComponent } from '../super-admin/entity-list-emp-client/entity-list-emp-client.component';
import { RoleDeptMenuListComponent} from '../super-admin/role-dept-menu-list/role-dept-menu-list.component';
import { SuperAdminService } from 'src/app/services/super-admin.service';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexStroke,
  ApexTooltip,
  ApexFill
} from 'ng-apexcharts';

export type SparklineOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  stroke: ApexStroke;
  tooltip: ApexTooltip;
  colors: string[];
  fill: ApexFill;
};

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  public settings: Settings;
  public countRecentEmployees: number = 0;
  public countRecentClients: number = 0;
  public growthEmployees: number = 0;
  public growthClients: number = 0;

  // Sparkline Chart Options
  public clientSparklineOptions: Partial<SparklineOptions>;
  public employeeSparklineOptions: Partial<SparklineOptions>;
  public earningsSparklineOptions: Partial<SparklineOptions>;

  constructor(
    public appSettings: AppSettings, 
    private dialog: MatDialog,
    private superAdminService: SuperAdminService
  ){
    this.settings = this.appSettings.settings; 
  }

  ngOnInit() {
    this.initSparklineCharts();
    this.loadCounts();
  }

  private initSparklineCharts(): void {
    const commonChartOptions: any = {
      type: 'area',
      height: 60,
      sparkline: { enabled: true },
      animations: { enabled: true, easing: 'easeinout', speed: 800 }
    };

    const commonStroke: any = { curve: 'smooth', width: 2 };
    const commonTooltip: any = {
      fixed: { enabled: false },
      x: { show: false },
      y: { title: { formatter: () => '' } },
      marker: { show: false }
    };
    
    // Gradient definitions
    const fillGradient = {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [0, 100]
      }
    };

    this.clientSparklineOptions = {
      series: [{ data: [12, 14, 2, 47, 42, 15, 35, 75, 40, 15, 20] }],
      chart: commonChartOptions,
      stroke: commonStroke,
      colors: ['#00e5ff'], // Cyan
      fill: fillGradient,
      tooltip: commonTooltip
    };

    this.employeeSparklineOptions = {
      series: [{ data: [47, 45, 74, 14, 56, 37, 54, 25, 41, 10] }],
      chart: commonChartOptions,
      stroke: commonStroke,
      colors: ['#ff00ff'], // Magenta
      fill: fillGradient,
      tooltip: commonTooltip
    };

    this.earningsSparklineOptions = {
      series: [{ data: [120, 240, 180, 480, 720, 580, 950, 1150, 1000] }],
      chart: commonChartOptions,
      stroke: commonStroke,
      colors: ['#00ff00'], // Green
      fill: fillGradient,
      tooltip: commonTooltip
    };
  }

  loadCounts() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    this.superAdminService.getAllEmployees().subscribe(res => {
      if (!res) return;
      const current = res.filter(e => new Date(e.created_at) >= thirtyDaysAgo).length;
      const previous = res.filter(e => new Date(e.created_at) >= sixtyDaysAgo && new Date(e.created_at) < thirtyDaysAgo).length;
      this.countRecentEmployees = current;
      this.growthEmployees = previous === 0 ? (current > 0 ? 100 : 0) : Math.round(((current - previous) / previous) * 100);
      
      // Update Employee Sparkline with actual data
      this.employeeSparklineOptions = {
        ...this.employeeSparklineOptions,
        series: [{ data: this.generateSparklineData(res, 30) }]
      };
    });
    this.superAdminService.getAllClients().subscribe(res => {
      if (!res) return;
      const current = res.filter(c => new Date(c.created_at) >= thirtyDaysAgo).length;
      const previous = res.filter(c => new Date(c.created_at) >= sixtyDaysAgo && new Date(c.created_at) < thirtyDaysAgo).length;
      this.countRecentClients = current;
      this.growthClients = previous === 0 ? (current > 0 ? 100 : 0) : Math.round(((current - previous) / previous) * 100);

      // Update Client Sparkline with actual data
      this.clientSparklineOptions = {
        ...this.clientSparklineOptions,
        series: [{ data: this.generateSparklineData(res, 30) }]
      };
    });
  }

  private generateSparklineData(items: any[], days: number = 30): number[] {
    const data = new Array(days).fill(0);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    items.forEach(item => {
      if (!item.created_at) return;
      const created = new Date(item.created_at);
      const diffTime = today.getTime() - created.getTime();
      
      // Only process past and present dates
      if (diffTime >= 0) {
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays < days) {
          // left-to-right (oldest-to-newest). Index 0 is oldest, days-1 is today.
          const index = (days - 1) - diffDays;
          data[index]++;
        }
      }
    });

    // If data is entirely empty, give it a tiny aesthetic baseline so the graph line still draws flat at 0.
    return data;
  }

  viewDetails(type: 'client' | 'employee') {
    const dialogRef = this.dialog.open(EntityListEmpClientComponent, {
      width: '90vw',
      maxWidth: '1200px',
      height: '80vh',
      disableClose: false,
      data: {
        type: type,
        title: type === 'client' ? 'Recently Added Legends' : 'Recently Added Heroes',
        filterRecent: true
      }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      // Reload counts after closing dialog in case a user was added
      this.loadCounts();
    });
  }

  action(type: 'department' | 'role' | 'menu'): void {
    const title = type === 'department' ? 'Department Actions' :
                  type === 'role' ? 'Role Actions' :
                  'Menu Details';
    const dialogRef = this.dialog.open(RoleDeptMenuListComponent, {
      width: '90vw',
      maxWidth: '1200px',
      height: '80vh',
      disableClose: false,
      data: { type, title }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
       // console.log('Dialog closed with result:', result);
      }
    });
  }
  
  

}
