import { Component, computed, forwardRef, inject, input, inputBinding, linkedSignal, model, OnDestroy, OnInit, signal, Type } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule, Validators } from '@angular/forms';
import { enumToOptions } from '../../../../helper-functions/enum-helper';
import { NotificationType } from '../../../../enums/notification-type';
import { Card } from 'primeng/card';
import { Select } from 'primeng/select';
import { FloatLabel } from 'primeng/floatlabel';
import { Subject, takeUntil } from 'rxjs';
import { CreateEmailGuardNotificationDTO, CreateEmailGuardNotificationDTOWIndex, CreateGuardNotificationDTO, CreateGuardNotificationDTOWIndex, EmailNotificationFormInfo, NotificationFormItem } from '../../../../interfaces/notification-dto';
import { isEmailProvider, isTextProvider } from '../../../../helper-functions/type-guards';
import { Tag } from 'primeng/tag';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { Button } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { InputText } from "primeng/inputtext";
import { Textarea } from 'primeng/textarea';
import { Listbox } from 'primeng/listbox';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { NotificationProviderDTO } from '../../../../interfaces/notification-provider-dto';
import { CreateEmailNotification } from '../create-email-notification/create-email-notification';
import { CreateNotificationProvider } from '../../../notification-provider-components/create-notification-provider/create-notification-provider';

@Component({
  selector: 'app-create-notification-control',
  imports: [CreateEmailNotification, Card, Select, ReactiveFormsModule, FloatLabel, Tag, InputGroup, InputGroupAddon, Button, TooltipModule, InputText, Textarea, Listbox, FormsModule],
  templateUrl: './create-notification-control.html',
  styleUrl: './create-notification-control.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CreateNotificationControl),
      multi: true
    }
  ]
})
export class CreateNotificationControl implements ControlValueAccessor, OnInit, OnDestroy {
  public notificationProviders = input.required<NotificationProviderDTO[]>();
  public currentProviders = linkedSignal<NotificationProviderDTO[]>(() => this.notificationProviders());

  public notifications = signal<CreateGuardNotificationDTO[]>([]); // The value of the notifications control
  public selectedNotifications = model<CreateGuardNotificationDTOWIndex[]>([]); // The items selected from indexedNotifications

  public indexedNotifications = computed<CreateGuardNotificationDTOWIndex[]>(() => // Copy of notifications but with an index key
    this.notifications().map((n, index) => ({ ...n, index: index }))
  );
  public disabled = signal<boolean>(false);
  private destroy = new Subject<void>();
  public isEmailProvider = isEmailProvider;
  public isTextProvider = isTextProvider;

  public notificationProvider = new FormControl<NotificationProviderDTO | null>(null, [Validators.required]);
  public notificationForm = new FormControl();

  private onChange: (value: CreateGuardNotificationDTO[]) => void = () => { };
  private onTouched: () => void = () => { };
  private dialogService = inject(DialogService);
  private createProviderRef?: DynamicDialogRef<CreateNotificationProvider> | null;

  ngOnInit(): void {

  }
  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
  writeValue(notification: CreateGuardNotificationDTO[]): void {
    this.notifications.set(notification);
  }
  registerOnChange(fn: (notification: CreateGuardNotificationDTO[]) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
  public onValueChanged(value: CreateGuardNotificationDTO[]): void {
    this.notifications.set(value);
    this.onChange(value);
  }
  public createNotificationProvider(): void {
    return;
  }
  public addEmailNotification(emailMessage: EmailNotificationFormInfo): void {
    const notificationProvider = this.notificationProvider.value!;
    const newNotification: CreateEmailGuardNotificationDTO = {
      id: emailMessage.id,
      emails: emailMessage.emails,
      emailSubject: emailMessage.emailSubject,
      emailBody: emailMessage.emailBody,
      notificationProvider: notificationProvider,
      notificationType: NotificationType.Email
    };
    this.notifications.update(values => {
      const newValues = [...values];
      if(emailMessage.index != undefined){
        newValues[emailMessage.index] = newNotification;
      }
      else {
        newValues.push(newNotification);
      }
      this.selectedNotifications.set([]);
      return newValues;
    });
    this.notificationProvider.reset();
    this.onChange(this.notifications());
    this.notificationForm.reset();
  }
  public cancelFormChanges(): void {
    this.notificationProvider.reset();
    this.notificationForm.reset();
  }
  public removeNotification(): void {
    if (this.selectedNotifications.length !== 1) {
      return;
    }
    const selectedIndices = this.selectedNotifications().map(n => n.index);
    const updated = this.notifications().filter((_, i) =>
      !selectedIndices.includes(i)
    );
    this.notifications.set(updated);
    this.onChange(this.notifications());
    this.selectedNotifications.set([]);
  }
  public addNotificationProvider(): void {
    this.createProviderRef = this.dialogService.open(CreateNotificationProvider, {
      header: 'Create notification provider',
      maximizable: true,
      closable: true,
      resizable: true,
      draggable: true
    });
    this.createProviderRef?.onClose.pipe(takeUntil(this.destroy)).subscribe({
      next: (newProvider: NotificationProviderDTO | undefined) => {
        if(newProvider){
          this.currentProviders.update(values => [...values, newProvider]);
        }
      }
    })
  }
  public editGuardNotification(): void {
    if(this.selectedNotifications().length !== 1) {
      return;
    }
    // Edit notification provider
    const notificationToEdit = this.selectedNotifications()[0];
    const notificationProvider = notificationToEdit.notificationProvider;
    this.notificationProvider.patchValue(notificationProvider);
    // Patch notification form depending on type
    switch(notificationToEdit.notificationType){
      case NotificationType.Email:
        const emailNotification = notificationToEdit as CreateEmailGuardNotificationDTOWIndex;
        this.patchEmailControl(emailNotification);
        break;
    }

  }
  private patchEmailControl(emailNotificationToEdit: CreateEmailGuardNotificationDTOWIndex): void {
    const emailMessage: EmailNotificationFormInfo = {
      id: emailNotificationToEdit.id,
      index: emailNotificationToEdit.index,
      emails: emailNotificationToEdit.emails,
      emailSubject: emailNotificationToEdit.emailSubject,
      emailBody: emailNotificationToEdit.emailBody
    };
    this.notificationForm.patchValue(emailMessage);
  }
}
