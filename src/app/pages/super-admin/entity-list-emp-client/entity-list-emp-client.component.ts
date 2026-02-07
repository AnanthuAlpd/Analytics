import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Employee, Client, SuperAdminService } from 'src/app/services/super-admin.service';

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
    private router: Router // Add this if you prefer router navigation
  ) { }

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.entityType = data['type'];
      this.data = data; // Set the data property
      
      if (this.entityType === 'client') {
        this.loadClients();
      } else if (this.entityType === 'employee') {
        this.loadEmployees();
      }
      
      this.title = this.entityType === 'client' ? 'Client List' : 'Employee List';
    });
  }

  // Add the missing goBack method
  goBack(): void {
    this.location.back(); // Go back to previous page
    // OR use router navigation:
    // this.router.navigate(['/super-admin']);
  }

  // Add missing action methods
  view(item: any): void {
    console.log('View:', item);
    // Implement view functionality
  }

  edit(item: any): void {
    console.log('Edit:', item);
    // Implement edit functionality
  }

  delete(item: any): void {
    console.log('Delete:', item);
    // Implement delete functionality
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
}