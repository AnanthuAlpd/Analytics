import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from 'src/app/services/auth.service';
import { SuperAdminService } from 'src/app/services/super-admin.service';
import { SnackbarService } from 'src/app/services/snackbar.service';


@Component({
  selector: 'app-update-emp-client',
  templateUrl: './update-emp-client.component.html',
  styleUrls: ['./update-emp-client.component.scss']
})
export class UpdateEmpClientComponent implements OnInit {

  updateForm: FormGroup;
  isLoading = false;
  departments: any;
  isEditMode = false;

  roles = [];

  constructor(
    private authService: AuthService,
    private superAdmService: SuperAdminService,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UpdateEmpClientComponent>,
    private snackbar: SnackbarService,
    @Inject(MAT_DIALOG_DATA) public data: { item: any; type: string }
  ) {
    this.isEditMode = !!this.data.item;
    this.updateForm = this.createForm();
  }

  ngOnInit(): void {
    this.populateForm();
    this.loadDepartments();
    this.loadRoles();
  }

  loadDepartments(){
    this.authService.getAllDepartments().subscribe(res => {
      this.departments = res;
    });
  }
  loadRoles(){
    this.superAdmService.getAllRoles().subscribe({
      next: (res) => {
        this.roles = res;    
      },
      error: (error) => {
        console.error('Error loading roles:', error);
      }
    });
  }

  private createForm(): FormGroup {
    const formConfig: any = {
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      mob_no: ['', [Validators.required, Validators.pattern(/^[+]?[\d\s\-\(\)]+$/)]],
      main_department: ['', [Validators.required]],
      other_departments: [[]],
      roles: [[], [Validators.required]]
    };

    if (!this.isEditMode) {
      formConfig.password = ['', [Validators.required, Validators.minLength(6)]];
    }

    return this.fb.group(formConfig);
  }

  private populateForm(): void {
    if (this.data.item) {
      const otherDeptIds = (this.data.item.other_departments || []).map(
        dept => dept.id
      );
  
      const roleIds = (this.data.item.roles || []).map(
        role => role.id
      );
  
      this.updateForm.patchValue({
        name: this.data.item.name || '',
        email: this.data.item.email || '',
        mob_no: this.data.item.mob_no || '',
        main_department: this.data.item.department_id || '',  
        other_departments: otherDeptIds,                      
        roles: roleIds                                        
      });
    }
  }
  

  onSave(): void {
    if (this.updateForm.valid) {
      this.isLoading = true;    
      const formData = { ...this.updateForm.value };
      
      // Map main_department to department_id for backend API
      if (formData.main_department) {
        formData.department_id = formData.main_department;
      }
      
      if (this.isEditMode) {
        const employeeId = this.data.item.id;
        this.superAdmService.updateEmployee(employeeId, formData).subscribe({
          next: (response) => {
            this.snackbar.showSuccess(`${this.capitalize(this.data.type)} updated successfully!`);
            this.dialogRef.close(response);
            this.isLoading = false;
          },
          error: (err) => {
            this.snackbar.showError(err?.error?.message || `Failed to update ${this.data.type}.`);
            console.error('Error updating:', err);
            this.isLoading = false;
          }
        });
      } else {
        // Add Mode
        const action$ = this.data.type === 'employee' 
          ? this.authService.register(formData) 
          : this.authService.registerClient(formData);

        action$.subscribe({
          next: (response) => {
            this.snackbar.showSuccess(`${this.capitalize(this.data.type)} added successfully!`);
            this.dialogRef.close(response);
            this.isLoading = false;
          },
          error: (err) => {
            this.snackbar.showError(err?.error?.message || `Failed to add ${this.data.type}.`);
            console.error(`Error adding ${this.data.type}:`, err);
            this.isLoading = false;
          }
        });
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
}
