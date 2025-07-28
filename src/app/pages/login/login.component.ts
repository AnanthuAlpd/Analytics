import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { emailValidator } from '../../theme/utils/app-validators';
import { AppSettings } from '../../app.settings';
import { Settings } from '../../app.settings.model';
import { AuthService } from 'src/app/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {
  public form: UntypedFormGroup;
  public settings: Settings;

  constructor(
    public appSettings: AppSettings,
    public fb: UntypedFormBuilder,
    public router: Router,
    public authService: AuthService,
    public snackBar: MatSnackBar
  ) {
    this.settings = this.appSettings.settings;
    this.form = this.fb.group({
      email: [null, Validators.compose([Validators.required, emailValidator])],
      password: [null, Validators.compose([Validators.required, Validators.minLength(6)])]
    });
  }

  public onSubmit(value: any): void {
    if (this.form.invalid) return;

    const loginData = this.form.value;
    //console.log(loginData);

    this.authService.login(loginData).subscribe({
      next: (response: any) => {
        this.snackBar.open('Login successful!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });

        // Fix token key
        localStorage.setItem('access_token', response.access_token); 
        localStorage.setItem('refresh_token', response.refresh_token);

        // Save user
        const userType = response.user_type;
        const user = userType === 'EMPLOYEE' ? response.employee : response.client;
        //console.log(user);
        //console.log(userType);
        
        localStorage.setItem('userType', userType);
        localStorage.setItem('user', JSON.stringify(user));


        // 🔀 Navigate based on user type
        if (userType === 'EMPLOYEE') {
          this.router.navigate(['/dashboard/employee']);
        } else if (userType === 'CLIENT') {
          this.router.navigate(['/dashboard/client']);
        } else {
          this.router.navigate(['/dashboard/demo']);
        }
      },
      error: (error) => {
        console.error('Login error:', error);
        this.snackBar.open(error?.error?.message || 'Login failed!', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.settings.loadingSpinner = false;
    }, 0);
  }
}
