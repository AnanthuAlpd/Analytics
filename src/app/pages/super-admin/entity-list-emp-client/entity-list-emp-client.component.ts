import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Employee, Client, SuperAdminService } from 'src/app/services/super-admin.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Optional, Inject } from '@angular/core';
import { UpdateEmpClientComponent } from '../update-emp-client/update-emp-client.component';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';
import { SnackbarService } from 'src/app/services/snackbar.service';

@Component({
  selector: 'app-entity-list-emp-client',
  templateUrl: './entity-list-emp-client.component.html',
  styleUrls: ['./entity-list-emp-client.component.scss']
})
export class EntityListEmpClientComponent implements OnInit {
  entityType: 'client' | 'employee' | null = null;
  title: string = '';
  data: any = {}; // Add this property
  employees: Employee[] = [];
  clients: Client[] = [];
  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = [];
  loading = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private route: ActivatedRoute, 
    private superAdminService: SuperAdminService,
    private location: Location, // Add this for goBack functionality
    private router: Router, // Add this if you prefer router navigation
    private dialog: MatDialog,
    private swal: SweetAlertService,
    private snackbar: SnackbarService,
    @Optional() public dialogRef: MatDialogRef<EntityListEmpClientComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public dialogData: any
  ) { }

  ngOnInit(): void {
    if (this.dialogData) {
      // It's a dialog
      this.entityType = this.dialogData.type;
      this.data = this.dialogData;
      this.title = this.dialogData.title || (this.entityType === 'client' ? 'Client List' : 'Employee List');
      this.loadData();
    } else {
      // It's a route
      this.route.data.subscribe(data => {
        this.entityType = data['type'];
        this.data = data; // Set the data property
        this.title = this.entityType === 'client' ? 'Client List' : 'Employee List';
        this.loadData();
      });
    }
  }

  loadData() {
    if (this.entityType === 'client') {
      this.loadClients();
    } else if (this.entityType === 'employee') {
      this.loadEmployees();
    }
  }

  loadInitialData() {
    this.loadData();
  }

  // Add the missing goBack method
  goBack(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    } else {
      this.location.back(); // Go back to previous page
    }
  }

  getInitials(name: string): string {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length > 1) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  // Add missing action methods
  view(item: any): void {
    const isEmp = this.entityType === 'employee';
    
    // Avatar Color Logic
    const colors = [
      'linear-gradient(135deg, #7986cb, #283593)', // 0
      'linear-gradient(135deg, #9c27b0, #7b1fa2)', // 1
      'linear-gradient(135deg, #00acc1, #00838f)', // 2
      'linear-gradient(135deg, #43a047, #2e7d32)', // 3
      'linear-gradient(135deg, #f4511e, #bf360c)'  // 4
    ];
    const charSum = item.name ? Array.from(item.name as string).reduce((sum, char) => sum + char.charCodeAt(0), 0) : 0;
    const bgGradient = colors[charSum % 5];
    const initials = this.getInitials(item.name);

    const rolesHtml = isEmp && item.roles ? item.roles.map((r: any) => 
      `<span style="background: #e0e7ff; color: #4338ca; padding: 4px 10px; border-radius: 12px; font-size: 12px; margin-right: 6px; font-weight: 600; display: inline-block; margin-top: 4px;">${r.name}</span>`
    ).join('') : '';

    const htmlContent = `
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="width: 88px; height: 88px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; background: ${bgGradient}; box-shadow: 0 8px 24px rgba(0,0,0,0.15); color: white; font-size: 32px; font-weight: 700; letter-spacing: 1px; border: 4px solid white;">
          ${initials}
        </div>
        <h2 style="margin: 0; padding: 0; font-size: 24px; font-weight: 700; color: #0f172a;">${item.name}</h2>
        <p style="margin: 4px 0 0; color: #64748b; font-size: 14px;">${isEmp ? (item.main_department || 'Employee') : 'Client Partner'}</p>
      </div>

      <div style="text-align: left; padding: 0 12px 12px;">
        <div style="margin-bottom: 12px; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px;">
          <strong style="color: #64748b; font-size: 13px; text-transform: uppercase;">Contact Info</strong>
          <p style="margin: 6px 0 0; color: #1e293b; font-size: 15px;"><mat-icon style="vertical-align: middle; font-size: 16px; color: #94a3b8;">email</mat-icon> <a href="mailto:${item.email}" style="color: #3b82f6; text-decoration: none;">${item.email}</a></p>
          <p style="margin: 6px 0 0; color: #1e293b; font-size: 15px;"><mat-icon style="vertical-align: middle; font-size: 16px; color: #94a3b8;">phone</mat-icon> ${item.mob_no || item.phone || 'Not Provided'}</p>
        </div>
        
        <div style="margin-bottom: 12px; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px;">
          <strong style="color: #64748b; font-size: 13px; text-transform: uppercase;">Overview</strong>
          <p style="margin: 6px 0 0; color: #1e293b; font-size: 15px;"><strong>Date Added:</strong> ${this.formatDate(item.created_at)}</p>
        </div>

        ${isEmp ? `
        <div>
          <strong style="color: #64748b; font-size: 13px; text-transform: uppercase;">Assigned Roles</strong>
          <div style="margin-top: 6px;">${rolesHtml || '<span style="color: #94a3b8; font-style: italic;">No specific roles assigned.</span>'}</div>
        </div>
        ` : ''}
      </div>
    `;

    this.swal.fire({
      html: htmlContent,
      background: '#ffffff',
      confirmButtonText: 'Close Profile',
      confirmButtonColor: '#3b82f6',
      customClass: {
        popup: 'rounded-sweet-alert shadow-lg',
        confirmButton: 'rounded-btn'
      }
    });
  }

  edit(item: any): void {
    const childDialogRef = this.dialog.open(UpdateEmpClientComponent, {
      width: '90vw',
      maxWidth: '600px',
      minWidth: '400px',
      data: {
        item: item,
        type: this.entityType
      }
    });

    childDialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (this.entityType === 'employee') {
          this.loadEmployees();
        } else if (this.entityType === 'client') {
          this.loadClients();
        }
      }
    });
  }

  async delete(item: any): Promise<void> {
    const confirmed = await this.swal.confirm('Are you sure?', `You are about to delete ${item.name}. This is a soft delete - the record will be hidden but not permanently erased.`);
    if (confirmed) {
      if (this.entityType === 'employee') {
        this.superAdminService.deleteEmployee(item.id).subscribe({
          next: () => {
            this.snackbar.showSuccess(`${item.name} deleted successfully!`);
            this.loadData();
          },
          error: (err) => {
            console.error('Delete failed', err);
            this.swal.error('Delete Failed', 'There was an error deleting this employee.');
          }
        });
      } else if (this.entityType === 'client') {
        const id = item.client_id || item.id;
        this.superAdminService.deleteClient(id).subscribe({
          next: () => {
            this.snackbar.showSuccess(`${item.name} deleted successfully!`);
            this.loadData();
          },
          error: (err) => {
            console.error('Delete failed', err);
            this.swal.error('Delete Failed', 'There was an error deleting this client.');
          }
        });
      }
    }
  }

  addNew() {
    console.log('Add new:', this.entityType);
    const childDialogRef = this.dialog.open(UpdateEmpClientComponent, {
      width: '90vw',
      maxWidth: '600px',
      minWidth: '400px',
      data: {
        item: null, // null item signifies Add mode
        type: this.entityType
      }
    });
  
    childDialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (this.entityType === 'employee') {
          this.loadEmployees();
        } else if (this.entityType === 'client') {
          this.loadClients();
        }
      }
    });
  }

  loadEmployees() {
    this.loading = true;
    this.displayedColumns = ['name', 'department', 'roles', 'mobile', 'created', 'actions'];
    this.superAdminService.getAllEmployees().subscribe({
      next: (employees) => {
        let filteredData = employees;
        if (this.data && this.data.filterRecent) {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          filteredData = employees.filter(e => new Date(e.created_at) >= thirtyDaysAgo);
        }
        this.employees = filteredData;
        this.dataSource = new MatTableDataSource(filteredData);
        this.setupDataSource();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.loading = false;
      }
    });
  }

  loadClients() {
    this.loading = true;
    this.displayedColumns = ['name', 'phone', 'createdAt', 'actions'];
    this.superAdminService.getAllClients().subscribe({
      next: (clients) => {
        let filteredData = clients;
        if (this.data && this.data.filterRecent) {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          filteredData = clients.filter(c => new Date(c.created_at) >= thirtyDaysAgo);
        }
        this.clients = filteredData;
        this.dataSource = new MatTableDataSource(filteredData);
        this.setupDataSource();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading clients:', error);
        this.loading = false;
      }
    });
  }

  setupDataSource() {
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
    
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const flatString = Object.values(data).join(' ').toLowerCase();
      return flatString.includes(filter.trim().toLowerCase());
    };
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getDeptClass(dept: string): string {
    if (!dept) return 'bg-slate-50 text-slate-400 border-slate-100';
    
    const d = dept.toLowerCase();
    if (d.includes('sales')) return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    if (d.includes('marketing')) return 'bg-pink-50 text-pink-600 border-pink-100';
    if (d.includes('tech') || d.includes('it') || d.includes('dev')) return 'bg-blue-50 text-blue-600 border-blue-100';
    if (d.includes('hr') || d.includes('human')) return 'bg-amber-50 text-amber-600 border-amber-100';
    if (d.includes('finance') || d.includes('acc')) return 'bg-violet-50 text-violet-600 border-violet-100';
    if (d.includes('admin')) return 'bg-rose-50 text-rose-600 border-rose-100';
    if (d.includes('support') || d.includes('service')) return 'bg-cyan-50 text-cyan-600 border-cyan-100';
    
    // Default dynamic color based on string hash
    const colors = [
      'bg-indigo-50 text-indigo-600 border-indigo-100',
      'bg-purple-50 text-purple-600 border-purple-100',
      'bg-teal-50 text-teal-600 border-teal-100',
      'bg-orange-50 text-orange-600 border-orange-100'
    ];
    const hash = dept.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }

  getRoleClass(role: string): string {
    if (!role) return 'bg-slate-50 text-slate-400 border-slate-100';
    
    const r = role.toLowerCase();
    if (r.includes('super') || r.includes('owner')) return 'bg-rose-100 text-rose-700 border-rose-200 shadow-sm';
    if (r.includes('admin')) return 'bg-amber-100 text-amber-700 border-amber-200';
    if (r.includes('manager') || r.includes('lead')) return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    if (r.includes('staff') || r.includes('employee')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (r.includes('client') || r.includes('external')) return 'bg-cyan-100 text-cyan-700 border-cyan-200';
    if (r.includes('dev') || r.includes('tech')) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    
    // Default dynamic color based on string hash for roles
    const colors = [
      'bg-slate-100 text-slate-600 border-slate-200',
      'bg-violet-50 text-violet-600 border-violet-100',
      'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100',
      'bg-teal-50 text-teal-600 border-teal-100'
    ];
    const hash = role.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }
}