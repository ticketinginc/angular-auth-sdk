/**
 * This is only for local test
 */
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Component } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { FormsModule } from '@angular/forms';

import { AuthModule, AuthService, Session }  from '@ticketing/angular-auth-sdk';
import { EventService } from '@ticketing/angular-core-sdk';

@Component({
  selector: 'app',
  templateUrl: "demo.html"
})
class AppComponent {
  public session: Session;
  public events: Array<any>;

  public merchant: string;
  public username: string;
  public password: string;

  constructor(private _authService: AuthService, private _eventService: EventService){
    this.session = this._authService.getActiveSession();
  }

  login(){
    this._authService.openMerchantSession(this.merchant,this.username,this.password).subscribe(session => {
      this.session = session;
    })
  }

  logout(){
      this.session.close();
  }

  listEvents(){
    this._eventService.listUpcoming(1,10).subscribe(events => {
      this.events = events;
    })
  }
}

@NgModule({
  bootstrap: [ AppComponent ],
  declarations: [ AppComponent ],
  imports: [ BrowserModule, FormsModule, AuthModule.forRoot({
    key:"d3b96c7c137b4f017234abdacf631f8c",
    secret:"4af33e5889b1e96ee6b9d2b602a0a1f0",
    production:false
  })]
})
class AppModule {}

platformBrowserDynamic().bootstrapModule(AppModule);
