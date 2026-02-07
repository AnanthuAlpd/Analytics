import { Component, OnInit, Input, Output, ViewEncapsulation, EventEmitter, SimpleChanges } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AppSettings } from '../../../../app.settings';
import { Settings } from '../../../../app.settings.model';
import { Menu } from '../menu.model';
import { MenuService } from '../menu.service';

@Component({
  selector: 'app-vertical-menu',
  templateUrl: './vertical-menu.component.html',
  styleUrls: ['./vertical-menu.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [ MenuService ]
})
export class VerticalMenuComponent implements OnInit {
  @Input('menuItems') menuItems: Menu[] = []; ;
  @Input('menuParentId') menuParentId: number | null = null;
  @Output() onClickMenuItem:EventEmitter<any> = new EventEmitter<any>();
  parentMenu:Array<any>;
  public settings: Settings;
  constructor(public appSettings:AppSettings, public menuService:MenuService, public router:Router) { 
    this.settings = this.appSettings.settings;
  }

  ngOnInit() {     
    //console.log("In vertical menu (ngOnInit)", this.menuItems);
      this.parentMenu = [];
  }
  ngAfterViewInit(){
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if(this.settings.fixedHeader){
          let mainContent = document.getElementById('main-content');
          if(mainContent){
            mainContent.scrollTop = 0;
          }
        }
        else{
          document.getElementsByClassName('mat-drawer-content')[0].scrollTop = 0;
        }
      }                
    });
  }

  onClick(menuId){
    this.menuService.toggleMenuItem(menuId);
    this.menuService.closeOtherSubMenus(this.menuItems, menuId);
    this.onClickMenuItem.emit(menuId);     
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['menuItems'] && this.menuItems) {
     // console.log("In vertical menu (ngOnChanges)", this.menuItems);
      this.parentMenu = this.menuItems.filter(item => item.parentId == this.menuParentId);
     // console.log("First menu", this.menuItems[0]);

    }
  }

  getChildren(menuId: number) {
    return this.menuItems.filter(child => child.parentId === menuId);
  }
  

}
