import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/aswims/auth.service';
import { NotificationService } from '../../../services/aswims/notification.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  hidePassword = true; // For password toggle logic

  constructor(
    private fb: FormBuilder,
    private dataService: AuthService,
    private router: Router,
    private notify: NotificationService,
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      identifier: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      password: ['', Validators.required]
    });
  }

  onLogin() {
    if (this.loginForm.valid) {
      this.dataService.login(this.loginForm.value).subscribe({
        next: (res) => {
          if (res.status === 'success') {
            localStorage.setItem('user_data', JSON.stringify(res.data.user));
            localStorage.setItem('access_token', res.data.access_token);
            this.notify.success('Welcome to ASWIMS!');
            this.router.navigate(['/aswims/dashboard']);
          }
        },
        error: (err) => {
          // This will now show: "Your account is currently 'Pending' admin approval..."
          console.log(err)
          const msg = err.error?.message || 'Login Failed';
          this.notify.error(msg)
        }
      });
    }
  }
}