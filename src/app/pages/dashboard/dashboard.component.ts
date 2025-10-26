import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AppSettings } from '../../app.settings';
import { Settings } from '../../app.settings.model';
import { ClientEmpListComponent } from '../super-admin/client-emp-list/client-emp-list.component';
import { RoleDeptMenuListComponent} from '../super-admin/role-dept-menu-list/role-dept-menu-list.component'

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  public settings: Settings;
  constructor(public appSettings:AppSettings,private dialog: MatDialog){
    this.settings = this.appSettings.settings; 
  }

  ngOnInit() {
  }
  viewDetails(type: 'client' | 'employee') {
    const dialogRef = this.dialog.open(ClientEmpListComponent, {
      width: '90vw',
      maxWidth: '1200px',
      height: '80vh',
      disableClose: false,
      data: {
        type: type,
        title: type === 'client' ? 'Client Details' : 'Employee Details'
      }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
       // console.log('Dialog closed with result:', result);
      }
    });
  }

  action(type: 'department' | 'role' | 'menu'): void {
    const title = type === 'department' ? 'Department Actions' :
                  type === 'role' ? 'Role Actions' :
                  'Menu Details';
    const dialogRef = this.dialog.open(RoleDeptMenuListComponent, {
      width: '90vw',
      maxWidth: '1200px',
      height: '80vh',
      disableClose: false,
      data: { type, title }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
       // console.log('Dialog closed with result:', result);
      }
    });
  }
  
  

}
