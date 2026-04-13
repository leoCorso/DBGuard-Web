import { Component, computed, forwardRef, inject, input, inputBinding, linkedSignal, OnDestroy, OnInit, signal, Type } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule, Validators } from '@angular/forms';
import { enumToOptions } from '../../../../helper-functions/enum-helper';
import { NotificationType } from '../../../../enums/notification-type';
import { Card } from 'primeng/card';
import { Select } from 'primeng/select';
import { FloatLabel } from 'primeng/floatlabel';
import { Subject, takeUntil } from 'rxjs';
import { CreateEmailGuardNotificationDTO, CreateGuardNotificationDTO, EmailMessage } from '../../../../interfaces/notification-dto';
import { isEmailProvider, isTextProvider } from '../../../../helper-functions/type-guards';
import { Tag } from 'primeng/tag';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { Button } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { InputText } from "primeng/inputtext";
import { Textarea } from 'primeng/textarea';
import { Listbox, ListboxClickEvent } from 'primeng/listbox';
import { toSignal } from '@angular/core/rxjs-interop';
import { isValidEmail } from '../../../../helper-functions/email-helper';
import { EmailForm } from './email-form/email-form';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ViewEmailNotificationDetail } from './view-email-notification-detail/view-email-notification-detail';
import { NotificationProviderDTO } from '../../../../interfaces/notification-provider-dto';
import { CreateNotificationProvider } from '../../../notification-providers-webpage/create-notification-provider/create-notification-provider';

@Component({
  selector: 'app-create-notification-control',
  imports: [EmailForm, Card, Select, ReactiveFormsModule, FloatLabel, Tag, InputGroup, InputGroupAddon, Button, TooltipModule, InputText, Textarea, Listbox, FormsModule],
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

  public notifications = signal<CreateGuardNotificationDTO[]>([]);
  public selectedNotifications: any[] = [];

  public indexedNotifications = computed(() =>
    this.notifications().map((n, index) => ({ ...n, __index: index }))
  );
  public disabled = signal<boolean>(false);
  private destroy = new Subject<void>();
  public isEmailProvider = isEmailProvider;
  public isTextProvider = isTextProvider;

  public notificationProvider = new FormControl<NotificationProviderDTO | null>(null, [Validators.required]);
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
  public addEmailNotification(emailMessage: EmailMessage): void {
    const notificationProvider = this.notificationProvider.value!;
    const newNotification: CreateEmailGuardNotificationDTO = {
      emails: emailMessage.emails,
      emailSubject: emailMessage.emailSubject,
      emailBody: emailMessage.emailBody,
      notificationProvider: notificationProvider,
      notificationType: NotificationType.Email
    };
    this.notifications.update(values => [...values, newNotification]);
    this.notificationProvider.reset();
    this.onChange(this.notifications());
  }
  public removeNotification(): void {
    if (this.selectedNotifications.length !== 1) {
      return;
    }
    const selectedIndices = this.selectedNotifications.map(n => n.__index);
    const updated = this.notifications().filter((_, i) =>
      !selectedIndices.includes(i)
    );
    this.notifications.set(updated);
    this.onChange(this.notifications());
    this.selectedNotifications = [];
  }
  public viewNotificationDetail(): void {
    if (this.selectedNotifications.length !== 1) {
      return;
    }
    let component: Type<unknown>;
    let header: string;
    const notifcationToView = this.selectedNotifications[0] as CreateGuardNotificationDTO;
    switch (notifcationToView.notificationType) {
      case NotificationType.Email:
        component = ViewEmailNotificationDetail;
        header = 'Email detail';
        break;
      case NotificationType.Text:
        break;
    }
    this.dialogService.open(component!, {
      header: header!,
      inputValues: {
        emailDetail: notifcationToView
      },
      draggable: true,
      resizable: true,
      maximizable: true,
      closable: true
    });
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
}
