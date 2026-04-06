import { Component, ElementRef, OnDestroy, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DashBoardService } from 'src/app/services/dashboard.service';
import { environment } from '../../../../environments/environment'
import { LeadsFormComponent } from 'src/app/shared/components/leads-form/leads-form.component';
import { LeadsService, Lead } from 'src/app/services/leads.service';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexStroke,
  ApexTooltip,
  ApexFill,
  ChartComponent,
  ApexXAxis
} from 'ng-apexcharts';

export type SparklineOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  stroke: ApexStroke;
  tooltip: ApexTooltip;
  colors: string[];
  fill: ApexFill;
  xaxis: ApexXAxis;
};

@Component({
  selector: 'app-emp-dashboard',
  templateUrl: './emp-dashboard.component.html',
  styleUrls: ['./emp-dashboard.component.scss']
})
export class EmpDashboardComponent implements OnInit, OnDestroy {

  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;
  @ViewChild('videoContainer') videoContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('clientChart') clientChartComponent!: ChartComponent;
  @ViewChild('employeeChart') employeeChartComponent!: ChartComponent;

  // Stats properties
  clientLeads: number = 0;
  employeeLeads: number = 0;
  totalEarnings: number = 15240; // TEST DATA: Keeping hardcoded as requested

  // Growth percentages (optional)
  clientLeadsGrowth?: number;
  employeeLeadsGrowth?: number;
  earningsGrowth?: number;

  // Sparkline Chart Options
  public clientSparklineOptions: Partial<SparklineOptions>;
  public employeeSparklineOptions: Partial<SparklineOptions>;
  public earningsSparklineOptions: Partial<SparklineOptions>;

  // UI state
  videoLoading: boolean = false;
  showQuickActions: boolean = true;
  vidSrc: string;
  vidJpg: string;

  // Subscription management
  private destroy$ = new Subject<void>();

  constructor(
    private dialog: MatDialog,
    private dashBoardService: DashBoardService,
    private leadsService: LeadsService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.vidSrc = `${environment.baseHref}assets/vid/intro.mp4`;
    this.vidJpg = `${environment.baseHref}assets/vid/intro.jpg`;
    this.initSparklineCharts();
    this.loadDashboardData();
    this.setupVideoEventListeners();
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
      x: { show: true },
      y: { title: { formatter: () => 'Count: ' } },
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
      series: [{ data: new Array(30).fill(0) }],
      chart: commonChartOptions,
      stroke: commonStroke,
      colors: ['#00e5ff'],
      fill: fillGradient,
      tooltip: commonTooltip
    };

    this.employeeSparklineOptions = {
      series: [{ data: new Array(30).fill(0) }],
      chart: commonChartOptions,
      stroke: commonStroke,
      colors: ['#ff00ff'],
      fill: fillGradient,
      tooltip: commonTooltip
    };

    this.earningsSparklineOptions = {
      series: [{ data: [120, 240, 180, 480, 720, 580, 950, 1150, 1000] }],
      chart: commonChartOptions,
      stroke: commonStroke,
      colors: ['#00ff00'],
      fill: fillGradient,
      tooltip: commonTooltip
    };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Generates a YYYY-MM-DD string from a Date object using local time.
   * This is more reliable than toLocaleDateString for exact matching.
   */
  private toLocalISO(date: Date): string {
    if (!date || isNaN(date.getTime())) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  /**
   * Safely parses a date string into a Local Date object.
   * Handles "YYYY-MM-DD" specifically to avoid UTC shifts.
   */
  private safeParseDate(dateVal: any): Date {
    if (!dateVal) return new Date(NaN);
    if (dateVal instanceof Date) return dateVal;
    
    // If it's a simple YYYY-MM-DD string, parse it as Local time
    if (typeof dateVal === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateVal.trim())) {
      const [y, m, d] = dateVal.trim().split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    
    // Otherwise rely on default parsing (handles ISO etc)
    return new Date(dateVal);
  }

  private loadDashboardData(): void {
    this.dashBoardService.getLeadsByEmployeeId()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res) {
            this.clientLeadsGrowth = this.calculateGrowth(res.client_previous, res.client_current);
            this.employeeLeadsGrowth = this.calculateGrowth(res.employee_previous, res.employee_current);
            this.earningsGrowth = 18; 
          }
        },
        error: (err) => console.error('Error loading summary stats:', err)
      });

    this.leadsService.getCurrentUserClientLeads()
      .pipe(takeUntil(this.destroy$))
      .subscribe(leads => {
        const leadsArray = leads || [];
        const currentMonth = this.toLocalISO(new Date()).substring(0, 7);
        
        this.clientLeads = leadsArray.filter(l => {
          const leadDate = this.safeParseDate(l.created_at);
          const leadKey = this.toLocalISO(leadDate);
          return leadKey.substring(0, 7) === currentMonth;
        }).length;
        
        const trend = this.getTrendData(leadsArray, 'Client');
        console.log(`[Sparkline] Final Client Array:`, trend.data);
        
        if (this.clientSparklineOptions) {
          this.clientSparklineOptions = { 
            ...this.clientSparklineOptions, 
            series: [{ name: 'Activity', data: [...trend.data] }],
            xaxis: { categories: [...trend.categories] }
          };
          
          // Force manual refresh
          setTimeout(() => {
            if (this.clientChartComponent) {
              this.clientChartComponent.updateOptions(this.clientSparklineOptions);
            }
          }, 100);
        }
        this.cdr.detectChanges();
      });

    this.leadsService.getCurrentUserEmployeeLeads()
      .pipe(takeUntil(this.destroy$))
      .subscribe(leads => {
        const leadsArray = leads || [];
        const currentMonth = this.toLocalISO(new Date()).substring(0, 7);

        this.employeeLeads = leadsArray.filter(l => {
          const leadDate = this.safeParseDate(l.created_at);
          const leadKey = this.toLocalISO(leadDate);
          return leadKey.substring(0, 7) === currentMonth;
        }).length;

        const trend = this.getTrendData(leadsArray, 'Employee');
        console.log(`[Sparkline] Final Employee Array:`, trend.data);

        if (this.employeeSparklineOptions) {
          this.employeeSparklineOptions = { 
            ...this.employeeSparklineOptions, 
            series: [{ name: 'Activity', data: [...trend.data] }],
            xaxis: { categories: [...trend.categories] }
          };

          // Force manual refresh
          setTimeout(() => {
            if (this.employeeChartComponent) {
              this.employeeChartComponent.updateOptions(this.employeeSparklineOptions);
            }
          }, 100);
        }
        this.cdr.detectChanges();
      });
  }

  private getTrendData(leads: Lead[], type: string): { data: number[], categories: string[] } {
    // Get today at midnight local time
    let endDate = new Date();
    endDate.setHours(0, 0, 0, 0);

    // If any lead is "ahead" of local time (Server/Timezone drift), 
    // extend the window so the lead isn't missed.
    leads.forEach(l => {
      const leadDate = this.safeParseDate(l.created_at);
      if (leadDate && !isNaN(leadDate.getTime()) && leadDate > endDate) {
        endDate = new Date(leadDate);
        endDate.setHours(0, 0, 0, 0);
      }
    });

    // Generate YYYY-MM-DD keys for the 30 days leading up to the end date
    const categories = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(endDate);
      d.setDate(d.getDate() - (29 - i));
      return this.toLocalISO(d);
    });

    const data = categories.map(targetKey => {
      return leads.filter(l => {
        const leadDate = this.safeParseDate(l.created_at);
        const leadKey = this.toLocalISO(leadDate);
        return leadKey === targetKey;
      }).length;
    });

    return { data, categories };
  }

  private calculateGrowth(previous: number, current: number): number {
    if (!previous || previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  private setupVideoEventListeners(): void {
    setTimeout(() => {
      if (this.videoPlayer?.nativeElement) {
        const video = this.videoPlayer.nativeElement;
        video.addEventListener('loadstart', () => this.videoLoading = true);
        video.addEventListener('canplay', () => this.videoLoading = false);
        video.addEventListener('error', () => this.videoLoading = false);
      }
    });
  }

  toggleFullscreen(): void {
    if (this.videoContainer?.nativeElement) {
      const container = this.videoContainer.nativeElement;
      if (!document.fullscreenElement) {
        container.requestFullscreen().catch(err => console.error(err));
      } else {
        document.exitFullscreen();
      }
    }
  }

  refreshData(): void {
    this.loadDashboardData();
  }

  viewDetails(type: 'client' | 'employee'): void {
    const route = type === 'client' ? '/user-leads/client-leads-list' : '/user-leads/emp-leads-list';
    this.router.navigate([route], { queryParams: { recent: true } });
  }

  shareVideo(): void {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: 'Program', url }).catch(err => console.error(err));
    } else {
      navigator.clipboard.writeText(url).then(() => console.log('Copied'));
    }
  }

  openLeadFormDialog(type: 'Client' | 'Employee'): void {
    const dialogRef = this.dialog.open(LeadsFormComponent, {
      width: '500px',
      data: { lead_cat: type }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadDashboardData();
    });
  }
}
