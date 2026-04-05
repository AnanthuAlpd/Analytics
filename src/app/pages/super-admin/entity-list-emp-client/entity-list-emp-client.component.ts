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
    console.log('View:', item);
    // Implement view functionality
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

  delete(item: any): void {
    if (confirm(`Are you sure you want to delete ${item.name}?`)) {
      console.log('Delete confirmed for:', item);
      // call delete method from service
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
}