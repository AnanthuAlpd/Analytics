import { Component, OnDestroy, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DashBoardService } from 'src/app/services/dashboard.service';
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

  @ViewChild('clientChart') clientChartComponent!: ChartComponent;
  @ViewChild('employeeChart') employeeChartComponent!: ChartComponent;
  @ViewChild('followUpChart') followUpChartComponent!: ChartComponent;

  // Stats properties
  clientLeads: number = 0;
  employeeLeads: number = 0;
  followUpLeads: number = 0;
  totalEarnings: number = 15240; // TEST DATA: Keeping hardcoded as requested

  // Growth percentages (optional)
  clientLeadsGrowth?: number;
  employeeLeadsGrowth?: number;
  earningsGrowth?: number;

  // Sparkline Chart Options
  public clientSparklineOptions: Partial<SparklineOptions>;
  public employeeSparklineOptions: Partial<SparklineOptions>;
  public followUpSparklineOptions: Partial<SparklineOptions>;
  public earningsSparklineOptions: Partial<SparklineOptions>;

  // UI state
  showQuickActions: boolean = true;

  // Training Resources
  trainingResources = [
    {
      title: 'PothansAI Basics',
      description: 'A comprehensive guide to getting started with PothansAI platform.',
      link: 'https://youtu.be/Bmez9J3MhNw?si=3I5fgfDwm_gq9tSG',
      icon: 'smart_toy',
      type: 'video'
    },
    {
      title: 'Prabha Analytics',
      description: 'Learn how to leverage Prabha Analytics for deeper insights.',
      link: 'https://youtu.be/PNcDXxZJqWU?si=cRVskgMyJlxjKjnN',
      icon: 'analytics',
      type: 'video'
    },
    {
      title: 'Niyamam SevaAI',
      description: 'Familiarize yourself with Niyamam SevaAI features and workflows.',
      link: 'https://youtu.be/loM60UK0ySQ?si=cezYpWfcBDek7_cD',
      icon: 'gavel',
      type: 'video'
    }
  ];

  documentResources = [
    {
      title: 'User Guide',
      description: 'Detailed documentation on platform features and usage.',
      link: '#',
      icon: 'description',
      type: 'pdf'
    },
    {
      title: 'Referral Policy',
      description: 'Understand the terms and rewards of our referral program.',
      link: '#',
      icon: 'policy',
      type: 'pdf'
    },
    {
      title: 'Platform FAQs',
      description: 'Frequently asked questions and troubleshooting tips.',
      link: '#',
      icon: 'help_outline',
      type: 'pdf'
    }
  ];

  // Calendar properties
  currentDate: Date = new Date();
  calendarDays: any[] = [];
  selectedDate: Date = new Date();
  monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // Lead Data for filtering
  allLeads: Lead[] = [];
  allFollowUps: Lead[] = [];
  leadNotifications: any[] = [];

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
    this.initSparklineCharts();
    this.loadDashboardData();
    this.generateCalendar();
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

    this.followUpSparklineOptions = {
      series: [{ data: new Array(30).fill(0) }],
      chart: commonChartOptions,
      stroke: commonStroke,
      colors: ['#ff5722'], // deep orange/warn color
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
        this.allLeads = leads || [];
        const leadsArray = this.allLeads;
        const currentMonth = this.toLocalISO(new Date()).substring(0, 7);
        
        this.clientLeads = leadsArray.filter(l => {
          const leadDate = this.safeParseDate(l.created_at);
          const leadKey = this.toLocalISO(leadDate);
          return leadKey.substring(0, 7) === currentMonth;
        }).length;
        
        const trend = this.getTrendData(leadsArray, 'Client');
        
        if (this.clientSparklineOptions) {
          this.clientSparklineOptions = { 
            ...this.clientSparklineOptions, 
            series: [{ name: 'Activity', data: [...trend.data] }],
            xaxis: { categories: [...trend.categories] }
          };
          
          setTimeout(() => {
            if (this.clientChartComponent) {
              this.clientChartComponent.updateOptions(this.clientSparklineOptions);
            }
          }, 100);
        }
        this.filterNotificationsByDate();
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

    this.leadsService.getFollowUpLeads()
      .pipe(takeUntil(this.destroy$))
      .subscribe(leads => {
        this.allFollowUps = leads || [];
        const leadsArray = this.allFollowUps;
        this.followUpLeads = leadsArray.length;

        const trend = this.getTrendData(leadsArray, 'FollowUp');

        if (this.followUpSparklineOptions) {
          this.followUpSparklineOptions = { 
            ...this.followUpSparklineOptions, 
            series: [{ name: 'Activity', data: [...trend.data] }],
            xaxis: { categories: [...trend.categories] }
          };

          setTimeout(() => {
            if (this.followUpChartComponent) {
              this.followUpChartComponent.updateOptions(this.followUpSparklineOptions);
            }
          }, 100);
        }

        this.filterNotificationsByDate();
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

  openResource(resource: any): void {
    if (resource.link && resource.link !== '#') {
      window.open(resource.link, '_blank');
    } else {
      // Mock notification for local files
      console.log(`Opening resource: ${resource.title}`);
    }
  }

  refreshData(): void {
    this.loadDashboardData();
  }

  viewDetails(type: 'client' | 'employee'): void {
    const route = type === 'client' ? '/user-leads/client-leads-list' : '/user-leads/emp-leads-list';
    this.router.navigate([route], { queryParams: { recent: true } });
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
  // ================= CALENDAR LOGIC =================
  generateCalendar(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();
    
    this.calendarDays = [];

    // Previous month's padding days
    for (let i = firstDay; i > 0; i--) {
      this.calendarDays.push({
        day: prevMonthDays - i + 1,
        currentMonth: false,
        hasActivity: false
      });
    }

    // Current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      const isToday = i === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
      
      // Random activity for demo (dates 5, 12, 18, 25)
      const hasActivity = [5, 12, 18, 25].includes(i);
      
      this.calendarDays.push({
        day: i,
        currentMonth: true,
        isToday,
        hasActivity,
        selected: i === this.selectedDate.getDate() && month === this.selectedDate.getMonth() && year === this.selectedDate.getFullYear()
      });
    }

    // Next month's padding days (to fill 42 cells grid)
    const remainingCells = 42 - this.calendarDays.length;
    for (let i = 1; i <= remainingCells; i++) {
      this.calendarDays.push({
        day: i,
        currentMonth: false,
        hasActivity: false
      });
    }
  }

  prevMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.generateCalendar();
  }

  nextMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.generateCalendar();
  }

  selectDate(day: any): void {
    if (day.currentMonth) {
      this.selectedDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day.day);
      this.generateCalendar();
      this.filterNotificationsByDate();
    }
  }

  filterNotificationsByDate(): void {
    const selectedKey = this.toLocalISO(this.selectedDate);
    const notifications: any[] = [];

    // 1. Filter Follow-ups for this date
    this.allFollowUps.forEach(l => {
      const followUpDate = this.toLocalISO(this.safeParseDate(l.follow_up_date));
      if (followUpDate === selectedKey) {
        notifications.push({
          type: 'followup',
          title: 'Follow-up Required',
          description: `Contact ${l.name} regarding ${l.remarks || 'scheduled update'}`,
          time: 'Scheduled',
          icon: 'notification_important',
          color: 'rose'
        });
      }
    });

    // 2. Filter New Leads created on this date
    this.allLeads.forEach(l => {
      const createdDate = this.toLocalISO(this.safeParseDate(l.created_at));
      if (createdDate === selectedKey) {
        notifications.push({
          type: 'new',
          title: 'Lead Assigned',
          description: `${l.name} was added to your queue`,
          time: this.getTimeAgo(l.created_at),
          icon: 'person_add',
          color: 'blue'
        });
      }
    });

    this.leadNotifications = notifications;
  }

  getTimeAgo(date: string | Date): string {
    const now = new Date();
    const past = new Date(date);
    const diffInMs = now.getTime() - past.getTime();
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    
    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInMins < 1440) return `${Math.floor(diffInMins / 60)}h ago`;
    return this.toLocalISO(past);
  }
}
