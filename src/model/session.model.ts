import { Observable, Subscriber, of } from 'rxjs';
import { ConfigService, Profile, Merchant, ProfileService, MerchantService } from '@ticketing/angular-core-sdk';
import { config } from '../config';

export class Session{
  public profile: Observable<Profile>;
  public merchant: Observable<Merchant>;

  constructor(public username: string, public role: string, public key: string, public secret: string,
              public startTime: Date, public endTime: Date, private _profile: string, private _merchant: string,
              private _profileService: ProfileService, private _merchantService: MerchantService,
              private _configService: ConfigService, private _appConfig: any, private _observer: Subscriber<Session>){
      this.startTime = new Date(startTime);
      this.endTime = endTime?new Date(endTime):null;
      this.profile = this._getProfile();
      this.merchant = this._getMerchant();
  }

  isOpen(): boolean{
    return (this.endTime)?false:true;
  }

  close(){
    this.endTime = new Date();
    this._configService.setKey(this._appConfig.key);
    this._configService.setSecret(this._appConfig.secret);
    this._configService.setBaseUrl(config[this._appConfig.production?"production":"sandbox"].BASE);

    this._observer.next(this);
  }

  private _getProfile(): Observable<Profile>{
    return this._profile?this._profileService.getByUri(this._profile):of(null);
  }

  private _getMerchant(): Observable<Merchant>{
    return this._merchantService.getByCode(this._merchant?this._merchant:"XXXX0000");
  }
}
