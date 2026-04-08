import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GuardOperator } from '../../../enums/guard-operator';
import { DatabaseConnectionDTO } from '../../../interfaces/database-connection-dto';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { Select } from 'primeng/select';
import { Message } from 'primeng/message';
import {FloatLabel} from 'primeng/floatlabel';
import { enumToOptions } from '../../../helper-functions/enum-helper';
import { InputNumber } from 'primeng/inputnumber';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { Button } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { CreateNotificationControl } from './create-notification-control/create-notification-control';
import { CreateGuardNotificationDTO, NotificationProviderDTO } from '../../../interfaces/notification-dto';
import { CreateGuardReferenceData } from '../../../interfaces/guard-dto';
import { Listbox } from 'primeng/listbox';

@Component({
  selector: 'app-create-guard',
  imports: [ReactiveFormsModule, InputText, Textarea, Select, Message, FloatLabel, InputNumber, ToggleSwitch, Button, TooltipModule, InputGroup, InputGroupAddon, CreateNotificationControl, Listbox],
  templateUrl: './create-guard.html',
  styleUrl: './create-guard.scss',
})
export class CreateGuard implements OnInit {

  public databaseConnections = signal<DatabaseConnectionDTO[]>([]);
  public notificationProviders = signal<NotificationProviderDTO[]>([]);

  private httpClient = inject(HttpClient);
  public enumOptions = enumToOptions(GuardOperator);

  public guardFormGroup = new FormGroup({
    guardName: new FormControl<string | null>(null),
    guardDescription: new FormControl<string | null>(null),
    triggerQuery: new FormControl<string | null>(null, [Validators.required]),
    countColumn: new FormControl<string | null>(null, [Validators.required]),
    triggerOperator: new FormControl<GuardOperator | null>(null, [Validators.required]),
    triggerValue: new FormControl<number | null>(null, [Validators.required]),
    databaseConnection: new FormControl<DatabaseConnectionDTO | null>(null, [Validators.required]),
    notifyOnClear: new FormControl<boolean>(true, [Validators.required]),
    notifyOnError: new FormControl<boolean>(true, [Validators.required]),
    notifyOnTrigger: new FormControl<boolean>(true, [Validators.required]),
    runPeriodInMinutes: new FormControl<number>(5, [Validators.required, Validators.min(1)]),
    notifications: new FormControl<CreateGuardNotificationDTO | null>(null)
  });
  ngOnInit(): void {
    this.getCreateGuardReferenceData();
  }
  private getCreateGuardReferenceData(): void {
    const url = [environment.api.uri, 'Guards', 'GetCreateGuardsReferenceData'].join('/');
    this.httpClient.get<CreateGuardReferenceData>(url).subscribe({
      next: (referenceData: CreateGuardReferenceData) => {
        this.databaseConnections.set(referenceData.databaseConnections);
        this.notificationProviders.set(referenceData.notificationProviders);
        console.log(`noti: ${JSON.stringify(this.notificationProviders)}`)
      }
    });
  }
}
