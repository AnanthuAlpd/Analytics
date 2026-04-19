import { Injectable } from '@angular/core';
import { SweetAlertService } from './sweet-alert.service';

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {
  constructor(private swal: SweetAlertService) {}

  show(message: string, isError: boolean = false) {
    if (isError) {
      this.swal.error('Error', message);
    } else {
      this.swal.success('Success', message);
    }
  }

  showSuccess(message: string) {
    this.swal.success('Success', message);
  }

  showError(message: string) {
    this.swal.error('Error', message);
  }

  showWarning(message: string) {
    this.swal.warning('Warning', message);
  }

  showInfo(message: string) {
    this.swal.info('Info', message);
  }
}
