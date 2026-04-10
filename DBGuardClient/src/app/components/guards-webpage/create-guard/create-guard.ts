import { Component, inject, input, model, OnDestroy, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { GuardOperator } from '../../../enums/guard-operator';
import { DatabaseConnectionDTO } from '../../../interfaces/database-connection-dto';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { Select } from 'primeng/select';
import { Message } from 'primeng/message';
import {FloatLabel} from 'primeng/floatlabel';
import { enumToOptions, getEnumLabel } from '../../../helper-functions/enum-helper';
import { InputNumber } from 'primeng/inputnumber';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { Button } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { CreateNotificationControl } from './create-notification-control/create-notification-control';
import { CreateGuardNotificationDTO, NotificationProviderDTO } from '../../../interfaces/notification-dto';
import { CreateGuardDTO, CreateGuardReferenceData } from '../../../interfaces/guard-dto';
import { Listbox, ListboxClickEvent } from 'primeng/listbox';
import { Tag } from 'primeng/tag';
import { Card } from 'primeng/card';
import { Dialog } from 'primeng/dialog';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CreateDbConnection } from '../../db-connections-webpage/create-db-connection/create-db-connection';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-create-guard',
  imports: [Card, Tag, ReactiveFormsModule, InputText, Textarea, Select, Message, FloatLabel, InputNumber, ToggleSwitch, Button, TooltipModule, InputGroup, InputGroupAddon, CreateNotificationControl, Listbox, FormsModule],
  templateUrl: './create-guard.html',
  styleUrl: './create-guard.scss',
})
export class CreateGuard implements OnInit, OnDestroy {

  public guardToEdit = input<CreateGuardDTO>();

  public databaseConnections = signal<DatabaseConnectionDTO[]>([]);
  public notificationProviders = signal<NotificationProviderDTO[]>([]);

  private httpClient = inject(HttpClient);
  public enumOptions = enumToOptions(GuardOperator);
  public getEnumLabel = getEnumLabel;
  private dialogService = inject(DialogService);
  private createDbConnectionRef?: DynamicDialogRef<CreateDbConnection> | null;
  private destroy = new Subject<void>();

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
    notifications: new FormControl<CreateGuardNotificationDTO[]>([])
  });

  ngOnInit(): void {
    this.getCreateGuardReferenceData();
    if(this.guardToEdit()){
      const guard = this.guardToEdit()!;
      this.guardFormGroup.patchValue({
        guardName: guard.guardName,
        guardDescription: guard.guardDescription,
        triggerQuery: guard.triggerQuery,
        countColumn: guard.countColumn,
        triggerOperator: guard.triggerOperator,
        triggerValue: guard.triggerValue,
        databaseConnection: guard.databaseConnection,
        notifyOnClear: guard.notifyOnClear,
        notifyOnError: guard.notifyOnError,
        notifyOnTrigger: guard.notifyOnTrigger,
        runPeriodInMinutes: guard.runPeriodInMinutes,
        notifications: guard.notifications
      });
    }
  }
  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  private getCreateGuardReferenceData(): void {
    const url = [environment.api.uri, 'Guards', 'GetCreateGuardsReferenceData'].join('/');
    this.httpClient.get<CreateGuardReferenceData>(url).subscribe({
      next: (referenceData: CreateGuardReferenceData) => {
        this.databaseConnections.set(referenceData.databaseConnections);
        this.notificationProviders.set(referenceData.notificationProviders);
      }
    });
  }
  public addDatabaseConnection(): void {
    this.createDbConnectionRef = this.dialogService.open(CreateDbConnection, {
      header: 'Create new database connection',
      closable: true,
      resizable: true,
      draggable: true,
      maximizable: true
    });
    this.createDbConnectionRef?.onClose.pipe(takeUntil(this.destroy)).subscribe(newConnection => {
      this.databaseConnections.update(conns => [...conns, newConnection]);
    });
  }
}
