import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AppSettings } from '../../app.settings';
import { Settings } from '../../app.settings.model';
import { User, UserProfile, UserWork, UserContacts, UserSocial, UserSettings } from './user.model';
import { UsersService } from './users.service';
import { UserDialogComponent } from './user-dialog/user-dialog.component';
import { SweetAlertService } from 'src/app/services/sweet-alert.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [ UsersService ]  
})
export class UsersComponent implements OnInit {
    public users: User[];
    public searchText: string;
    public page:any;
    public settings: Settings;
    constructor(public appSettings:AppSettings, 
                public dialog: MatDialog,
                public usersService:UsersService,
                private swal: SweetAlertService){
        this.settings = this.appSettings.settings; 
    }

    ngOnInit() {
        this.getUsers();         
    }

    public getUsers(): void {
        this.users = null; //for show spinner each time
        this.usersService.getUsers().subscribe(users => this.users = users);    
    }
    public addUser(user:User){
        this.usersService.addUser(user).subscribe(user => {
            this.swal.success('Success', 'User added successfully!');
            this.getUsers();
        });
    }
    public updateUser(user:User){
        this.usersService.updateUser(user).subscribe(user => {
            this.swal.success('Success', 'User updated successfully!');
            this.getUsers();
        });
    }
    public async deleteUser(user:User){
        const confirmed = await this.swal.confirm('Are you sure?', `You are about to delete user ${user.username}. This action cannot be undone!`);
        if (confirmed) {
            this.usersService.deleteUser(user.id).subscribe({
                next: () => {
                    this.swal.success('Deleted!', 'User has been deleted.');
                    this.getUsers();
                },
                error: (err) => {
                    this.swal.error('Error', 'Failed to delete user.');
                }
            });
        }
    }


    public onPageChanged(event){
        this.page = event;
        this.getUsers();
        if(this.settings.fixedHeader){      
            document.getElementById('main-content').scrollTop = 0;
        }
        else{
            document.getElementsByClassName('mat-drawer-content')[0].scrollTop = 0;
        }
    }

    public openUserDialog(user){
        let dialogRef = this.dialog.open(UserDialogComponent, {
            data: user
        });

        dialogRef.afterClosed().subscribe(user => {
            if(user){
                (user.id) ? this.updateUser(user) : this.addUser(user);
            }
        });
    }

}