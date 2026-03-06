import { Injectable } from '@angular/core';
import { Settings } from './app.settings.model';
import { environment } from 'src/environments/environment';

@Injectable()
export class AppSettings {
    public settings = new Settings(
        'PothensAI',       //theme name
        true,           //loadingSpinner
        true,           //fixedHeader
        true,           //sidenavIsOpened
        true,           //sidenavIsPinned
        true,           //sidenavUserBlock
        'vertical',     //horizontal , vertical
        'default',      //default, compact, mini
        'indigo-light', //indigo-light, teal-light, red-light, blue-dark, green-dark, pink-dark
        false,          // true = rtl, false = ltr
        true,           // true = has footer, false = no footer
        environment.baseUrl
    )
}

