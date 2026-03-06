import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntypedFormGroup, UntypedFormBuilder, Validators, FormControl } from '@angular/forms';
import { emailValidator, matchingPasswords } from '../../theme/utils/app-validators';
import { AppSettings } from '../../app.settings';
import { Settings } from '../../app.settings.model';
import { AuthService } from 'src/app/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit, AfterViewInit {
  userType: 'EMPLOYEE' | 'CLIENT' = 'EMPLOYEE';
  public form: UntypedFormGroup;
  public settings: Settings;
  employees: any;
  departments: any;
  services: any;
  public staticWebsiteUrl: any;
  public hide = true;
  public loading = false;
  constructor(
    public appSettings: AppSettings,
    public fb: UntypedFormBuilder,
    public router: Router,
    public authService: AuthService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute
  ) {
    this.settings = this.appSettings.settings;

    // Create form with common fields
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, emailValidator]],
      mob_no: ['', [Validators.required, Validators.minLength(10)]],
      password: ['', Validators.required],
      confirm_password: ['', Validators.required]
    }, { validator: matchingPasswords('password', 'confirm_password') });
  }

  ngOnInit() {
    const type = this.route.snapshot.paramMap.get('userType');
    this.userType = (type?.toUpperCase() === 'CLIENT') ? 'CLIENT' : 'EMPLOYEE';
    this.staticWebsiteUrl = environment.staticWebSiteUrl;
    this.addDynamicControls();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.settings.loadingSpinner = false;
    }, 0);

    this.authService.getAllEmployees().subscribe(res => {
      this.employees = res;
    });

    this.authService.getAllDepartments().subscribe(res => {
      this.departments = res;
    });

    this.authService.getAllServices().subscribe(res => {
      this.services = res;
    });
  }

  private addDynamicControls(): void {
    if (this.userType === 'EMPLOYEE') {
      this.form.addControl('department_id', new FormControl('', Validators.required));
      this.form.addControl('parent_id', new FormControl('')); // Optional for hierarchy
    } else if (this.userType === 'CLIENT') {
      this.form.addControl('service_id', new FormControl('', Validators.required));
      this.form.addControl('parent_id', new FormControl('')); // Optional for client referral
    }
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      this.snackBar.open('Please fill in all required fields correctly.', 'Close', { duration: 3000 });
      return;
    }

    this.loading = true;
    const userData = this.form.value;

    if (this.userType === 'EMPLOYEE') {
      this.authService.register(userData).subscribe({
        next: () => {
          this.loading = false;
          this.snackBar.open('Employee registered!', 'Close', { duration: 3000, panelClass: ['success-snackbar'] });
          this.router.navigate(['/login']);
        },
        error: (error) => {
          this.loading = false;
          this.snackBar.open(error?.error?.message || 'Employee registration failed!', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    } else if (this.userType === 'CLIENT') {
      this.authService.registerClient(userData).subscribe({
        next: () => {
          this.loading = false;
          this.snackBar.open('Client registered!', 'Close', { duration: 3000, panelClass: ['success-snackbar'] });
          this.router.navigate(['/login']);
        },
        error: (error) => {
          this.loading = false;
          this.snackBar.open(error?.error?.message || 'Client registration failed!', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

}
