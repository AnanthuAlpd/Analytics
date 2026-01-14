import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { AuthService } from '../../../services/aswims/auth.service';
import { NotificationService } from '../../../services/aswims/notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {

  regForm!: FormGroup;
  
  appointments: any[] = [];
  mainSpecialities: any[] = [];
  superSpecialities: any[] = [];
  hidePassword = true;
  hideConfirmPassword = true;

  constructor(
    private fb: FormBuilder, 
    private authService: AuthService,
    private notify: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadInitialData();
  }

  initForm() {
    this.regForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      mob_no: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      designation_id: ['', Validators.required],
      // Removed Validators.required from Speciality
      speciality_id: [null], 
      super_speciality_id: [null]
    }, { 
      validators: this.passwordMatchValidator 
    });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  loadInitialData() {
    this.authService.getAllAppointments().subscribe({
      next: (res) => { if (res.status === 'success') this.appointments = res.data; },
      error: () => this.notify.error('Failed to load designations')
    });

    this.authService.getMainSpecialities().subscribe({
      next: (res) => { if (res.status === 'success') this.mainSpecialities = res.data; },
      error: () => this.notify.error('Failed to load specialities')
    });
  }

  onSpecialityChange(event: any) {
    const parentId = event.value;
    
    // Always reset super speciality when main speciality changes
    this.superSpecialities = [];
    this.regForm.get('super_speciality_id')?.setValue(null);

    if (parentId) {
      this.authService.getSuperSpecialities(parentId).subscribe({
        next: (res) => {
          if (res.status === 'success') {
            this.superSpecialities = res.data;
          }
        },
        error: () => this.notify.error('Failed to load super-specialities')
      });
    }
  }

  onSubmit() {
    if (this.regForm.valid) {
      this.authService.registerUser(this.regForm.value).subscribe({
        next: (response) => {
          if (response.status === 'success') {
            this.notify.success('Registration Successful! Redirecting to login...');
            setTimeout(() => {
              this.router.navigate(['/aswims/login']); 
            }, 2000);
          }
        },
        error: (err) => {
          const errorMessage = err.error?.message || 'Registration failed';
          this.notify.error(errorMessage);
        }
      });
    } else {
      this.regForm.markAllAsTouched();
      this.notify.error('Please check the form for errors.');
    }
  }
}