import { Component, OnInit, ViewEncapsulation, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { MessagesService } from './messages.service';
import { LeadsService, Lead } from '../../../services/leads.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [ MessagesService ]
})
export class MessagesComponent implements OnInit {  
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;
  public selectedTab:number=1;
  public messages:Array<Object>;
  public files:Array<Object>;
  public meetings:Array<Object>;  
  public followUpLeads: Lead[] = [];

  constructor(
    private messagesService: MessagesService,
    private leadsService: LeadsService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) { 
    this.messages = messagesService.getMessages();
    this.files = messagesService.getFiles();
    this.meetings = messagesService.getMeetings();    
  }

  ngOnInit() {
    this.loadFollowUpLeads();
  }

  private loadFollowUpLeads() {
    const isAdmin = this.authService.hasRole(1);
    const leads$ = isAdmin ? this.leadsService.getAllFollowUpLeads() : this.leadsService.getFollowUpLeads();
    
    leads$.subscribe({
        next: (leads) => {
            this.followUpLeads = leads || [];
            this.cdr.detectChanges();
        },
        error: (err) => console.error('Error fetching follow-ups for notifications:', err)
    });
  }

  openMessagesMenu() {
    this.trigger.openMenu();
    this.selectedTab = 0;
  }

  onMouseLeave(){
    this.trigger.closeMenu();
  }

  stopClickPropagate(event: any){
    event.stopPropagation();
    event.preventDefault();
  }

}
