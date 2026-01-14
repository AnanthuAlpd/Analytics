import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { AuthService } from '../../../services/aswims/auth.service';
import { NotificationService } from '../../../services/aswims/notification.service'; // Integrated new service

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = ['name', 'designation', 'speciality', 'status', 'actions'];
  isLoading = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private dataService: AuthService,
    private notify: NotificationService // Injected centralized service
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading = true;
    this.dataService.getAllUsers().subscribe({
      next: (res) => {
        if (res.status === 'success') {
          // Sort: Pending users always at the top
          const sortedData = res.data.sort((a: any, b: any) => 
            a.account_status === 'Pending' ? -1 : 1
          );
          this.dataSource.data = sortedData;
          this.dataSource.paginator = this.paginator;
        }
        this.isLoading = false;
      },
      error: () => {
        this.notify.error('Failed to load user directory'); // Using notification service
        this.isLoading = false;
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Specifically for the Approve button, but uses the common status change logic
   */
  approveUser(userId: number): void {
    this.changeUserStatus(userId, 'Active');
  }

  /**
   * Centralized method to handle Active, Inactive, or Pending state changes
   */
  changeUserStatus(userId: number, newStatus: string): void {
    this.dataService.changeUserStatus(userId, newStatus).subscribe({
      next: (res) => {
        if (res.status === 'success') {
          // Dynamic messaging based on the action performed
          const msgMap: { [key: string]: string } = {
            'Active': 'Staff Member activated successfully',
            'Inactive': 'Staff Member deactivated',
            'Pending': 'Status reverted to pending'
          };

          this.notify.success(msgMap[newStatus] || 'User status updated');
          this.loadUsers(); // Refresh data to show updated status chips
        }
      },
      error: (err) => {
        const errorMsg = err.error?.message || 'Status update failed';
        this.notify.error(errorMsg);
      }
    });
  }
}