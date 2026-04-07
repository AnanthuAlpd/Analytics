import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { SuperAdminService } from 'src/app/services/super-admin.service';
import { MenuService } from 'src/app/theme/components/menu/menu.service';
import {ICONS } from 'src/app/shared/icons.data'

@Component({
  selector: 'app-update-role-dept-menu',
  templateUrl: './update-role-dept-menu.component.html',
  styleUrls: ['./update-role-dept-menu.component.scss']
})
export class UpdateRoleDeptMenuComponent implements OnInit {
  icons = ICONS;
  form!: FormGroup;
  isEditMode = false;
  allRoles:any;
  parentMenus:any;
  constructor(
    public dialogRef: MatDialogRef<UpdateRoleDeptMenuComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { type: string, title: string, item?: any },
    private fb: FormBuilder,
    private superAdminService: SuperAdminService,
    private menuService: MenuService,private snackbar: SnackbarService
  ) {}

  ngOnInit(): void {
    this.isEditMode = !!this.data.item;
    this.buildForm();
    this.loadRoles();
    this.loadParentMenus();
  }
  buildForm() {
    if (this.data.type === 'department') {
      this.form = this.fb.group({
        name: [this.data.item?.name || '', Validators.required]
      });
    } else if (this.data.type === 'role') {
      this.form = this.fb.group({
        name: [this.data.item?.name || '', Validators.required],
        description: [this.data.item?.description || '']
      });
    } else if (this.data.type === 'menu') {
      this.form = this.fb.group({
        title: [this.data.item?.title || '', Validators.required],
        router_link: [this.data.item?.router_link || ''],
        icon: [this.data.item?.icon || ''],
        has_sub_menu: [this.data.item?.has_sub_menu ?? false],
        parent_id: [this.data.item?.parent_id || null],
        roles: [this.data.item?.roles?.map((r: any) => r.id) || []]
      });
    }
  }

  loadRoles() {
    this.superAdminService.getAllRoles().subscribe((res: any) => {
      this.allRoles = res;
    });
  }

  loadParentMenus() {
    this.menuService.getAllMenus().subscribe((res: any) => {
      this.parentMenus = res.filter((m: any) => m.has_sub_menu === true);   
    });
  }

  save() {
    if (this.form.invalid) return;
    const payload = this.form.value;
  
    let request$;
  
    if (this.data.type === 'department') {
      request$ = this.isEditMode
        ? this.superAdminService.updateDepartment(this.data.item.id, payload)
        : this.superAdminService.createDepartment(payload);
    }
  
    if (this.data.type === 'role') {
      request$ = this.isEditMode
        ? this.superAdminService.updateRole(this.data.item.id, payload)
        : this.superAdminService.createRole(payload);
    }
  
    if (this.data.type === 'menu') {
      request$ = this.isEditMode
        ? this.menuService.updateMenu(this.data.item.id, payload)
        : this.menuService.createMenu(payload);
    }
  
    // Common subscribe block with global snackbar service
    request$.subscribe({
      next: () => {
        this.snackbar.showSuccess(
          `${this.capitalize(this.data.type)} ${this.isEditMode ? 'updated' : 'created'} successfully ✅`
        );
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.snackbar.showError(
          err?.error?.message ||
          `Failed to ${this.isEditMode ? 'update' : 'create'} ${this.data.type} ❌`
        );
      }
    });
  }
  
  // Optional helper for clean messages
  private capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
  
  
}
