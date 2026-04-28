import { inject, Injectable } from '@angular/core';
import { CreateGuardDTO, SimpleGuardDTO } from '../interfaces/guard-dto';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EntityChangeService {
  public guardEdited = new Subject<number>(); // Used to alert components displaying details that guard has been edited
  public guardCreated = new Subject<number>();
  public providerCreated = new Subject<number>();
  public providerEdited = new Subject<number>();
  public dbConnectionCreated = new Subject<number>(); // Used to alert components displaying db connections that a new connection has been created
  public dbConnectionEdited = new Subject<number>();
  public userCreated = new Subject<string>();
  public userEdited = new Subject<string>();
}
