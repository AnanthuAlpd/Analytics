import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from 'src/app/services/auth.service';
import { SuperAdminService } from 'src/app/services/super-admin.service';


@Component({
  selector: 'app-update-emp-client',
  templateUrl: './update-emp-client.component.html',
  styleUrls: ['./update-emp-client.component.scss']
})
export class UpdateEmpClientComponent implements OnInit {

  updateForm: FormGroup;
  isLoading = false;
  departments: any;

  roles = [];

  constructor(
    private authService: AuthService,
    private superAdmService: SuperAdminService,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UpdateEmpClientComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { item: any; type: string }
  ) {
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
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      mob_no: ['', [Validators.required, Validators.pattern(/^[+]?[\d\s\-\(\)]+$/)]],
      main_department: ['', [Validators.required]],
      other_departments: [[]],
      roles: [[], [Validators.required]]
    });
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
      const formData = this.updateForm.value;
      const employeeId = this.data.item.id;
      console.log(formData);
      this.superAdmService.updateEmployee(employeeId,formData).subscribe({
        next: (response) => {
          this.dialogRef.close(response);
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading chart data:', err);
          this.isLoading = false;
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.updateForm.controls).forEach(key => {
      const control = this.updateForm.get(key);
      control?.markAsTouched();
    });
  }

}
