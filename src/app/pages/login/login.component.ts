import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { emailValidator } from '../../theme/utils/app-validators';
import { AppSettings } from '../../app.settings';
import { Settings } from '../../app.settings.model';
import { AuthService } from 'src/app/services/auth.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { environment } from 'src/environments/environment';
// 1. New Imports
import { MatDialog } from '@angular/material/dialog';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  public form: UntypedFormGroup;
  public settings: Settings;
  public userType: 'EMPLOYEE' | 'CLIENT' = 'EMPLOYEE';
  public staticWebsiteUrl: any;
  public hide = true;
  public loading = false;

  constructor(
    public appSettings: AppSettings,
    public fb: UntypedFormBuilder,
    public router: Router,
    public authService: AuthService,
    public snackbar: SnackbarService,
    private route: ActivatedRoute,
    public dialog: MatDialog // 2. Inject MatDialog
  ) {
    this.settings = this.appSettings.settings;
    this.form = this.fb.group({
      email: [null, Validators.compose([Validators.required, emailValidator])],
      password: [null, Validators.compose([Validators.required, Validators.minLength(6)])]
    });
  }

  ngOnInit() {
    const type = this.route.snapshot.paramMap.get('userTypes');
    this.userType = (type?.toUpperCase() === 'CLIENT') ? 'CLIENT' : 'EMPLOYEE';
    this.staticWebsiteUrl = environment.staticWebSiteUrl;
  }

  public onSubmit(value: any): void {
    if (this.form.invalid) return;

    this.loading = true;
    const loginData = this.form.value;

    this.authService.login(loginData).subscribe({
      next: (response: any) => {
        this.loading = false;
        this.snackbar.showSuccess('Login successful!');

        // Fix token key
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('refresh_token', response.refresh_token);

        // Save user
        const userType = response.user_type;
        const user = response.user;

        localStorage.setItem('userType', userType);
        localStorage.setItem('user', JSON.stringify(user));

        // Navigate based on user type
        if (userType === 'EMPLOYEE') {
          this.router.navigate(['/dashboard/employee']);
        } else if (userType === 'CLIENT') {
          this.router.navigate(['/dashboard/client']);
        } else {
          this.router.navigate(['/dashboard/demo']);
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Login error:', error);
        this.snackbar.showError(error?.error?.message || 'Login failed!');
      }
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.settings.loadingSpinner = false;
    }, 0);
  }

  // 3. Updated Forgot Password Logic
  forgotPwd() {
    // Get the email if the user typed it in the login form
    const currentEmail = this.form.get('email')?.value || '';

    // Open the dialog
    this.dialog.open(ForgotPasswordComponent, {
      width: '450px', // Slightly wider to accommodate the two fields nicely
      disableClose: true, // Prevents closing by clicking outside (optional)
      data: {
        email: currentEmail,
        userType: this.userType
      }
    });
  }
}