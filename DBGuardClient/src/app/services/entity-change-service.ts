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
  public dbConnectionCreated = new Subject<void>(); // Used to alert components displaying db connections that a new connection has been created
}
