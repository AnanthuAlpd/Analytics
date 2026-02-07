import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private snackBar: MatSnackBar) {}

  /**
   * Universal method to show notifications
   * @param message The text to display
   * @param type 'success' | 'error' | 'info' | 'warning'
   */
  showNotification(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') {
    const config: MatSnackBarConfig = {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: [`snack-${type}`] // Custom CSS classes
    };

    this.snackBar.open(message, 'Close', config);
  }

  // Helper methods for cleaner code
  success(msg: string) { this.showNotification(msg, 'success'); }
  error(msg: string) { this.showNotification(msg, 'error'); }
  info(msg: string) { this.showNotification(msg, 'info'); }
}