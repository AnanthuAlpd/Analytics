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
  async confirm(title: string, text: string = '', confirmButtonText: string = 'Yes, delete it!', icon: 'warning' | 'question' = 'warning'): Promise<boolean> {
    const result = await Swal.fire({
      title: title,
      text: text,
      icon: icon,
      showCancelButton: true,
      confirmButtonColor: '#3f51b5', // Consistent with Angular Material Primary
      cancelButtonColor: '#f44336',  // Consistent with Angular Material Warn
      confirmButtonText: confirmButtonText,
      background: '#fff',
      customClass: {
        popup: 'rounded-sweet-alert'
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
      timer: 2500,
      showConfirmButton: false,
      customClass: {
        popup: 'rounded-sweet-alert'
      }
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
      confirmButtonText: 'Ok',
      confirmButtonColor: '#3f51b5',
      customClass: {
        popup: 'rounded-sweet-alert'
      }
    });
  }

  /**
   * Warning Alert
   */
  warning(title: string, text: string = '') {
    return Swal.fire({
      title: title,
      text: text,
      icon: 'warning',
      confirmButtonText: 'Ok',
      confirmButtonColor: '#3f51b5',
      customClass: {
        popup: 'rounded-sweet-alert'
      }
    });
  }

  /**
   * Info Alert
   */
  info(title: string, text: string = '') {
    return Swal.fire({
      title: title,
      text: text,
      icon: 'info',
      confirmButtonText: 'Ok',
      confirmButtonColor: '#3f51b5',
      customClass: {
        popup: 'rounded-sweet-alert'
      }
    });
  }

  /**
   * Toast Alert (Optional subtle notification)
   */
  toast(message: string, icon: 'success' | 'error' | 'warning' | 'info' = 'success') {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    });

    return Toast.fire({
      icon: icon,
      title: message
    });
  }
}
