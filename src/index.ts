import { NgModule, ModuleWithProviders } from '@angular/core';
import { TicketingModule } from '@ticketing/angular-core-sdk';

import { AuthService } from './service/auth.service';

export { AuthService } from './service/auth.service';
export { Session } from './model/session.model';

@NgModule({
  imports: [
    TicketingModule.forRoot({
      key:"",
      secret:"",
      production:false,
      caching:false
    })
  ]
})
export class TickeTingAuthModule {
  static forRoot(appConfig: any): ModuleWithProviders {
    return {
      ngModule: TickeTingAuthModule,
      providers: [
        {provide: 'APP_CONFIG', useValue: appConfig},
        AuthService
      ]
    };
  }
}
