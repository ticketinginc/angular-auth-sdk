/**
 * This is only for local test
 */
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Component } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AuthModule, AuthService, Session }  from '@ticketing/angular-auth-sdk';
import { ConfigService, EventService } from '@ticketing/angular-core-sdk';

@Component({
  selector: 'app',
  templateUrl: "demo.html"
})
class AppComponent {
  public session: Session;
  constructor(_authService: AuthService, _configService: ConfigService, _eventService: EventService){
    _authService.openMerchantSession("seng8919","sven.james","password").subscribe(session => {
      this.session = session;
    })
  }
}

@NgModule({
  bootstrap: [ AppComponent ],
  declarations: [ AppComponent ],
  imports: [ BrowserModule, AuthModule.forRoot({
    key:"d3b96c7c137b4f017234abdacf631f8c",
    secret:"4af33e5889b1e96ee6b9d2b602a0a1f0",
    production:false
  })]
})
class AppModule {}

platformBrowserDynamic().bootstrapModule(AppModule);
