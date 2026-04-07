import { Injectable } from '@angular/core';
import Swal, { SweetAlertOptions } from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class SweetAlertService {

  constructor() { }

  /**
   * Generic fire method
   */
  fire(options: SweetAlertOptions) {
    return Swal.fire(options);
  }

  /**
   * Confirmation dialog
   */
  async confirm(title: string, text: string = '', confirmButtonText: string = 'Yes, delete it!'): Promise<boolean> {
    const result = await Swal.fire({
      title: title,
      text: text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: confirmButtonText,
      background: '#fff', // You can customize this for dark mode if needed
      customClass: {
        popup: 'glass-swal' // Optional: hook into your existing glassmorphism if applicable
      }
    });

    return result.isConfirmed;
  }

  /**
   * Success Alert
   */
  success(title: string, text: string = '') {
    return Swal.fire({
      title: title,
      text: text,
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    });
  }

  /**
   * Error Alert
   */
  error(title: string, text: string = '') {
    return Swal.fire({
      title: title,
      text: text,
      icon: 'error',
      confirmButtonText: 'Ok'
    });
  }
}
