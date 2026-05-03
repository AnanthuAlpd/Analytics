import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Department, Role, SuperAdminService } from 'src/app/services/super-admin.service';
import { Menu } from 'src/app/theme/components/menu/menu.model';
import { MenuService } from 'src/app/theme/components/menu/menu.service';
import { UpdateRoleDeptMenuComponent } from '../update-role-dept-menu/update-role-dept-menu.component';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';
import { SnackbarService } from 'src/app/services/snackbar.service';

@Component({
  selector: 'app-role-dept-menu-list',
  templateUrl: './role-dept-menu-list.component.html',
  styleUrls: ['./role-dept-menu-list.component.scss']
})
export class RoleDeptMenuListComponent implements OnInit, AfterViewInit {
  departments: Department[] = [];
  roles: Role[] = []
  menus: Menu[] = [];
  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = [];
  loading = true;
  errorMessage: string | null = null;
  isUnauthorized = false;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  constructor(
    public dialogRef: MatDialogRef<RoleDeptMenuListComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { type: string, title: string },
    private superAdminService: SuperAdminService, 
    private menuService: MenuService, 
    private dialog: MatDialog,
    private swal: SweetAlertService,
    private snackbar: SnackbarService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadData();
  }
  loadData() {
    this.errorMessage = null;
    this.isUnauthorized = false;
    if (this.data.type === 'department') {
      this.loadDepartments();
    } else if (this.data.type === 'role') {
      this.loadRoles();
    }
    else if (this.data.type === 'menu') {
      this.loadMenus();
    }
  }
    
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadDepartments() {
    this.loading = true;
    this.displayedColumns = ['sl_no', 'name', 'actions'];
    this.superAdminService.getAllDepartments().subscribe({
      next: (res) => {
        this.departments = res;
        this.dataSource = new MatTableDataSource(res);
        this.setupDataSource();
        this.loading = false;
      },
      error: (error) => {
        this.handleError(error);
      }
    });
  }

  loadRoles() {
    this.loading = true;
    this.displayedColumns = ['sl_no', 'name', 'descriptions', 'actions'];
    this.superAdminService.getAllRoles().subscribe({
      next: (res) => {
        this.roles = res;
        this.dataSource = new MatTableDataSource(res);
        this.setupDataSource();
        this.loading = false;
      },
      error: (error) => {
        this.handleError(error);
      }
    });
  }
  loadMenus() {
    this.loading = true;
    this.displayedColumns = ['sl_no', 'title', 'router_link', 'actions'];
    this.menuService.getAllMenus().subscribe({
      next: (res) => {
        this.menus = res;
        this.dataSource = new MatTableDataSource(res);
        this.setupDataSource();
        this.loading = false;
      },
      error: (error) => {
        this.handleError(error);
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

  addNew(): void {
    const childDialogRef = this.dialog.open(UpdateRoleDeptMenuComponent, {
      width: '600px',
      data: { type: this.data.type, title: `Add ${this.data.type.charAt(0).toUpperCase() + this.data.type.slice(1)}` }
    }).afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
      }
    });
  }

  edit(item: any): void {
    const childDialogRef = this.dialog.open(UpdateRoleDeptMenuComponent, {
      width: '600px',
      data: {
        type: this.data.type,
        title: `Edit ${this.data.type.charAt(0).toUpperCase() + this.data.type.slice(1)}`,
        item: item
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
      }
    });
  }

  async delete(item: any): Promise<void> {
    const type = this.data.type;
    const name = item.name || item.title || 'this item';
    const confirmed = await this.swal.confirm('Are you sure?', `You are about to delete ${type}: "${name}". This action cannot be undone!`);
    
    if (confirmed) {
      let deleteRequest$: Observable<any>;
      
      if (type === 'department') {
        deleteRequest$ = this.superAdminService.deleteDepartment(item.id);
      } else if (type === 'role') {
        deleteRequest$ = this.superAdminService.deleteRole(item.id);
      } else if (type === 'menu') {
        deleteRequest$ = this.menuService.deleteMenu(item.id);
      } else {
        return;
      }

      deleteRequest$.subscribe({
        next: () => {
          this.snackbar.showSuccess(`${this.capitalize(type)} deleted successfully!`);
          this.loadData();
        },
        error: (err) => {
          this.snackbar.showError(err?.error?.message || `Failed to delete ${type}.`);
        }
      });
    }
  }

  private handleError(error: any) {
    this.loading = false;
    if (error.status === 401) {
      this.isUnauthorized = true;
      this.errorMessage = 'Your session has expired. Please login again to continue.';
    } else {
      this.errorMessage = error.error?.message || `Failed to load ${this.data.type}s. Please try again later.`;
    }
    console.error(`Error loading ${this.data.type}s:`, error);
  }

  logout() {
    this.dialogRef.close();
    // Assuming you have a logout method in your auth service or just navigate to login
    this.router.navigate(['/login']);
  }

  private capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
}
