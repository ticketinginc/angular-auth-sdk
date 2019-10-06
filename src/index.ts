import { NgModule, ModuleWithProviders } from '@angular/core';
import { TicketingModule } from '@ticketing/angular-core-sdk';

import { AuthService } from './service/auth.service';

export { AuthService } from './service/auth.service';
export { Session } from './model/session.model';

@NgModule({
  imports: [
    TicketingModule
  ]
})
export class AuthModule {
  static forRoot(appConfig: any): ModuleWithProviders {
    return {
      ngModule: AuthModule,
      providers: [
        {provide: 'APP_CONFIG', useValue: appConfig},
        AuthService
      ]
    };
  }
}
