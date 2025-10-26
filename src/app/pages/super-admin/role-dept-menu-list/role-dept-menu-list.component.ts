import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Department, Role, SuperAdminService } from 'src/app/services/super-admin.service';
import { Menu } from 'src/app/theme/components/menu/menu.model';
import { MenuService } from 'src/app/theme/components/menu/menu.service';
import { UpdateRoleDeptMenuComponent } from '../update-role-dept-menu/update-role-dept-menu.component';

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
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  constructor(
    public dialogRef: MatDialogRef<RoleDeptMenuListComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { type: string, title: string },
    private superAdminService: SuperAdminService, private menuService: MenuService, private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadData();
  }
  loadData(){if (this.data.type === 'department') {
    this.loadDepartments();
  } else if (this.data.type === 'role') {
    this.loadRoles();
  }
  else if (this.data.type === 'menu') {
    this.loadMenus();
  }}
    
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
        console.error('Error loading departments:', error);
        this.loading = false;
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
        console.error('Error loading roles:', error);
        this.loading = false;
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
        console.error('Error loading roles:', error);
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
}
