import { Component, Inject, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Client, Employee, SuperAdminService } from 'src/app/services/super-admin.service';
import { UpdateEmpClientComponent } from '../update-emp-client/update-emp-client.component'

@Component({
  selector: 'app-client-emp-list',
  templateUrl: './client-emp-list.component.html',
  styleUrls: ['./client-emp-list.component.scss']
})
export class ClientEmpListComponent implements OnInit, AfterViewInit {
  employees: Employee[] = [];
  clients: Client[] = [];

  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = [];

  loading = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    public dialogRef: MatDialogRef<ClientEmpListComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { type: string, title: string },
    private superAdminService: SuperAdminService,private dialog: MatDialog
  ) {}

  ngOnInit() {
    if (this.data.type === 'client') {
      this.loadClients();
    } else if (this.data.type === 'employee') {
      this.loadEmployees();
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadEmployees() {
    this.loading = true;
    this.displayedColumns = ['name', 'department', 'roles', 'mobile', 'created', 'actions'];

    this.superAdminService.getAllEmployees().subscribe({
      next: (employees) => {
        this.employees = employees;
        this.dataSource = new MatTableDataSource(employees);
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
    this.displayedColumns = ['name', 'email', 'phone', 'createdAt', 'actions'];

    this.superAdminService.getAllClents().subscribe({
      next: (clients) => {
        this.clients = clients;
        this.dataSource = new MatTableDataSource(clients);
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

  // Action Handlers (can be shared between both types)
  view(item: any) {
    console.log('View:', item);
  }

  edit(item: any): void {
    const childDialogRef = this.dialog.open(UpdateEmpClientComponent, {
      width: '90vw', // 90% of viewport width for flexibility
      maxWidth: '600px', // Matches SCSS max-width
      minWidth: '400px', // Matches SCSS min-width
      data: {
        item: item,
        type: this.data.type
      }
    });
  
    childDialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (this.data.type === 'employee') {
          this.loadEmployees();
        }
      }
    });
  }
  
  

  delete(item: any) {
    if (confirm(`Are you sure you want to delete ${item.name}?`)) {
      console.log('Delete confirmed for:', item);
      // call delete method from service
    }
  }

  addNew() {
    console.log('Add new:', this.data.type);
    // handle add for both types
  }
}