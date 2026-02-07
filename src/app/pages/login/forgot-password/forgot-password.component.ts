import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  
  // Forms
  verifyForm!: FormGroup;
  resetForm!: FormGroup;

  // State flags
  isVerified = false;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ForgotPasswordComponent>,
    private snackBar: MatSnackBar,
    private authService: AuthService, // Inject the service
    @Inject(MAT_DIALOG_DATA) public data: { email: string, userType: string }
  ) { }

  ngOnInit(): void {
    // 1. Initialize Verification Form
    this.verifyForm = this.fb.group({
      email: [this.data.email || '', [Validators.required, Validators.email]],
      mob_no: ['', [Validators.required, Validators.minLength(10)]] 
    });

    // 2. Initialize Reset Password Form
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm_password: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  /**
   * Custom validator to ensure passwords match
   */
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirm = control.get('confirm_password')?.value;
    return password === confirm ? null : { mismatchedPasswords: true };
  }

  /**
   * Step 1: Call Backend to Verify Identity
   */
  onVerify(): void {
    if (this.verifyForm.invalid) return;

    this.isLoading = true;
    const { email, mob_no } = this.verifyForm.value;

    this.authService.verifyIdentity(email, mob_no).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.isVerified = true; // Switch view to reset password form
        this.snackBar.open(response.message || 'Identity Verified', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar'] // Optional styling
        });
      },
      error: (err) => {
        this.isLoading = false;
        // Display backend error message (e.g., "Email and Mobile number do not match")
        const errorMessage = err.error?.message || 'Verification failed. Please check your details.';
        this.snackBar.open(errorMessage, 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  /**
   * Step 2: Call Backend to Reset Password
   */
  onReset(): void {
    if (this.resetForm.invalid) return;

    this.isLoading = true;
    const { password } = this.resetForm.value;
    // We get the email from the verified form to ensure security
    const email = this.verifyForm.get('email')?.value;

    this.authService.resetPassword(email, password).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.snackBar.open('Password reset successfully! Please login.', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.dialogRef.close(); // Close the dialog
      },
      error: (err) => {
        this.isLoading = false;
        const errorMessage = err.error?.message || 'Password reset failed. Please try again.';
        this.snackBar.open(errorMessage, 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}