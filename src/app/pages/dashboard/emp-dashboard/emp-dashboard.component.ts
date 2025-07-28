import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DashBoardService } from 'src/app/services/dashboard.service';
import { environment } from '../../../../environments/environment'
import { LeadsFormComponent} from './leads-form/leads-form.component'

@Component({
  selector: 'app-emp-dashboard',
  templateUrl: './emp-dashboard.component.html',
  styleUrls: ['./emp-dashboard.component.scss']
})
export class EmpDashboardComponent implements OnInit, OnDestroy {

  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;
  @ViewChild('videoContainer') videoContainer!: ElementRef<HTMLDivElement>;

  // Stats properties
  clientLeads: number = 0;
  employeeLeads: number = 0;
  totalEarnings: number = 0;

  // Growth percentages (optional)
  clientLeadsGrowth?: number;
  employeeLeadsGrowth?: number;
  earningsGrowth?: number;

  // UI state
  videoLoading: boolean = false;
  showQuickActions: boolean = true;
  vidSrc: string;
  vidJpg: string;

  constructor(private dialog: MatDialog,private dashBoardService: DashBoardService) {}

  ngOnInit(): void {
    this.vidSrc = `${environment.baseHref}assets/vid/intro.mp4`;
     this.vidJpg = `${environment.baseHref}assets/vid/intro.jpg`;
    this.loadDashboardData();
    this.setupVideoEventListeners();
  }

  ngOnDestroy(): void {
    // Clean up any subscriptions or event listeners
  }

  private loadDashboardData(): void {
    this.dashBoardService.getLeadsByEmployeeId().subscribe({
      next: (res) => {
        // Set total leads
        this.clientLeads = res.total_client_leads || 0;
        this.employeeLeads = res.total_employee_leads || 0;
        this.totalEarnings = 0.00;
        // Calculate growth rates
        this.clientLeadsGrowth = this.calculateGrowth(res.client_previous, res.client_current);
        this.employeeLeadsGrowth = this.calculateGrowth(res.employee_previous, res.employee_current);
        this.earningsGrowth = 18; // Placeholder if earnings growth isn't calculated from backend
      },
      error: (err) => {
        console.error('Error loading dashboard stats:', err);
      }
    }); 
  }
  private calculateGrowth(previous: number, current: number): number {
    if (!previous || previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }


  private setupVideoEventListeners(): void {
    // Set up video event listeners after view init
    setTimeout(() => {
      if (this.videoPlayer?.nativeElement) {
        const video = this.videoPlayer.nativeElement;
        
        video.addEventListener('loadstart', () => {
          this.videoLoading = true;
        });

        video.addEventListener('canplay', () => {
          this.videoLoading = false;
        });

        video.addEventListener('error', (error) => {
          console.error('Video loading error:', error);
          this.videoLoading = false;
        });
      }
    });
  }

  toggleFullscreen(): void {
    if (this.videoContainer?.nativeElement) {
      const container = this.videoContainer.nativeElement;
      
      if (!document.fullscreenElement) {
        container.requestFullscreen().catch(err => {
          console.error('Error attempting to enable fullscreen:', err);
        });
      } else {
        document.exitFullscreen();
      }
    }
  }

  // Method to refresh dashboard data
  refreshData(): void {
    this.loadDashboardData();
  }

  
  viewReports(): void {
    // Navigate to reports page
    console.log('Navigate to reports');
  }

  viewClientLeadDetails(): void {
    // Navigate to client leads details
    console.log('View client lead details');
  }

  viewEmployeeLeadDetails(): void {
    // Navigate to employee leads details
    console.log('View employee lead details');
  }

  viewEarningsDetails(): void {
    // Navigate to earnings details
    console.log('View earnings details');
  }

  shareVideo(): void {
    if (navigator.share) {
      navigator.share({
        title: 'About the Programme',
        text: 'Learn more about our referral program',
        url: window.location.href
      }).catch(err => console.error('Error sharing:', err));
    } else {
      // Fallback for browsers that don't support Web Share API
      const url = window.location.href;
      navigator.clipboard.writeText(url).then(() => {
        // Show success message (you might want to use a snackbar here)
        console.log('URL copied to clipboard');
      });
    }
  }

  openLeadFormDialog(type: 'Client' | 'Employee'): void {
    const dialogRef = this.dialog.open(LeadsFormComponent, {
      width: '500px',
      data: { lead_cat: type }  // Pass initial type
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadDashboardData();
      }
    });
  }

}
