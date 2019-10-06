import { Injectable, Inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

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

      this._connection = this._connectionService.openConnection();
  }

  openSession(username: string, password: string): Observable<Session>{
    let self = this;
    return Observable.create(observer => {
      self._openSession(username,password).subscribe(userData => {
        if(userData){
          self._buildSession(userData).subscribe(session => {
            this._saveSession(session);
          })
        }

        observer.next(self._session);
      })
    })
  }

  openMerchantSession(merchantCode: string, username: string, password: string): Observable<Session>{
    let self = this;
    return Observable.create(observer => {
      self._openSession(username,password,merchantCode).subscribe(userData => {
        if(userData){
          self._buildSession(userData).subscribe(session => {
            this._saveSession(session);
          })
        }

        observer.next(self._session);
      })
    });
  }

  getActiveSession(){
    let sessionKey = "@ticketing/angular-auth-sdk:last-session";
    if(!this._session && localStorage.getItem(sessionKey)){
      let userData = JSON.parse(localStorage.getItem(sessionKey));
      this._configService.setKey(userData.key);
      this._configService.setSecret(userData.secret);
      this._configService.setBaseUrl(config[this._env].API);

      this._buildSession(userData).subscribe(session => {
        this._saveSession(session);
      })
    }

    return this._session;
  }

  private _openSession(username: string, password: string, merchantCode: string = ""): Observable<any>{
    let endpoint = `/users`;
    let self = this;
    let connectionService = this._connectionService;
    let realUsername = (merchantCode?`${merchantCode};`:"")+username;

    if(this._session){
      this._session.close();
    }

    return Observable.create(observer => {
      self._connection.get(endpoint,{
        usernames:realUsername
      }).pipe(map((users: any) => users.entries))
        .subscribe(
          users => {
            if(users.length > 0){
              let user = users[0];

              //Open user authenticated connection for token retrieval
              self._configService.setKey(realUsername);
              self._configService.setSecret(password);
              let authConnection = connectionService.openConnection();

              authConnection.get(this.getEndpoint(user.tokens)).subscribe(
                tokens => {
                  //Configure config service for session
                  self._configService.setKey(tokens.key);
                  self._configService.setSecret(tokens.secret);
                  self._configService.setBaseUrl(config[this._env].API);

                  let userData = {
                    username:username,
                    role:user.role,
                    key:tokens.key,
                    secret:tokens.secret,
                    profile:user.options.profile,
                    merchantCode:merchantCode
                  };

                  observer.next(userData);
                },
                error => {
                  self._configService.setKey(self._appConfig.key);
                  self._configService.setSecret(self._appConfig.secret);
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

  private _buildSession(userData: any){
    return Observable.create(observer => {
      observer.next(new Session(
        userData.username,
        userData.role,
        userData.key,
        userData.secret,
        new Date(),
        null,
        userData.profile,
        userData.merchantCode,
        this._profileService,
        this._merchantService,
        this._configService,
        this._appConfig,
        observer
      ))
    })
  }

  private _saveSession(session: Session){
    let sessionKey = "@ticketing/angular-auth-sdk:last-session";
    this._session = session;
    if(session.isOpen()){
      session.profile.subscribe(profile => {
        session.merchant.subscribe(merchant => {
          (merchant?merchant.tokens:of({code:""})).subscribe(tokens => {
            let userData = {
              username:session.username,
              role:session.role,
              key:session.key,
              secret:session.secret,
              profile:(profile?config[this._env].API+profile.endpoint:""),
              merchantCode:tokens.code
            };

            localStorage.setItem(sessionKey,JSON.stringify(userData));
            this._session = session;
          })
        })
      })
    }else{
      localStorage.removeItem(sessionKey);
    }
  }
}
