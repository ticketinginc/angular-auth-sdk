import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { config } from '../config';
import { ConfigService, ConnectionService, Connection,
          ModelService, ProfileService, MerchantService } from '@ticketing/angular-core-sdk';
import { Session } from '../model/session.model';

@Injectable()
export class AuthService extends ModelService{
  private _session: Session;
  private _env: string;

  constructor(@Inject('APP_CONFIG') private _appConfig: any, _configService: ConfigService,
              private _connectionService: ConnectionService, private _profileService: ProfileService,
              private _merchantService: MerchantService){
      super(_configService,_connectionService);
      _configService.setKey(_appConfig.key);
      _configService.setSecret(_appConfig.secret);

      this._env = _appConfig.production?"production":"sandbox";
      _configService.setBaseUrl(config[this._env].BASE);

      _configService.baseUrl.subscribe(baseUrl => {
         this._baseUrl = baseUrl;
      })

      this._connection = _connectionService.openConnection();
  }

  openSession(username: string, password: string): Observable<Session>{
    let self = this;
    return Observable.create(observer => {
      self._openSession(username,password).subscribe(userData => {
        if(userData){
          self._session = new Session(
            userData.username,
            userData.role,
            userData.key,
            userData.secret,
            new Date(),
            null,
            userData.profile,
            "",
            self._profileService,
            self._merchantService,
            self._configService,
            self._appConfig
          );
        }

        observer.next(self._session);
      })
    })
  }

  openMerchantSession(merchantCode: string, username: string, password: string): Observable<Session>{
    let self = this;
    return Observable.create(observer => {
      this._openSession(merchantCode+";"+username,password).subscribe(userData => {
        if(userData){
          self._session = new Session(
            username,
            userData.role,
            userData.key,
            userData.secret,
            new Date(),
            null,
            userData.profile,
            merchantCode,
            self._profileService,
            self._merchantService,
            self._configService,
            self._appConfig
          );
        }

        observer.next(self._session);
      })
    });
  }

  private _openSession(username: string, password: string): Observable<any>{
    let endpoint = `/apis/${config[this._env].API_ID}/users`;
    let self = this;

    if(this._session){
      this._session.close();
    }

    return Observable.create(observer => {
      self._connection.get(endpoint,{
        usernames:username
      }).map(users => users.entries)
        .subscribe(
          users => {
            if(users.length > 0){
              let user = users[0];

              //Open user authenticated connection for token retrieval
              self._configService.setKey(username);
              self._configService.setSecret(password);
              let authConnection = self._connectionService.openConnection();

              authConnection.get(this.getEndpoint(user.tokens)).subscribe(
                tokens => {
                  //Configure config service for session
                  self._configService.setKey(tokens.key);
                  self._configService.setSecret(tokens.secret);
                  self._configService.setBaseUrl(config[this._env].API);

                  observer.next({
                    username:user.username,
                    role:user.role,
                    key:tokens.key,
                    secret:tokens.secret,
                    profile:user.options.profile
                  });
                },
                error => {
                  observer.next(null);
                }
              )
            }else{
              observer.next(null);
            }
          },
          error => {
            observer.next(null);
          }
        )
    })
  }
}
