import { Component, computed, DestroyRef, forwardRef, inject, input, model, OnDestroy, signal } from '@angular/core';
import { FormControl, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule, Validators } from '@angular/forms';
import { NotificationProviderDTO } from '../../../../interfaces/notification-provider-dto';
import { CreateEmailGuardNotificationDTOWIndex, CreateGuardNotificationDTO, CreateGuardNotificationDTOWIndex } from '../../../../interfaces/notification-dto';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { NotificationType } from '../../../../enums/notification-type';
import { CreateNotificationProvider } from '../../../notification-provider-components/create-notification-provider/create-notification-provider';
import { Listbox } from 'primeng/listbox';
import { Tag } from 'primeng/tag';
import { Button } from 'primeng/button';
import { FloatLabel } from 'primeng/floatlabel';
import { InputGroup } from 'primeng/inputgroup';
import { Select } from 'primeng/select';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { CreateEmailNotification } from '../create-email-notification/create-email-notification';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-create-notification-control',
  imports: [Listbox, FormsModule, Tag, Button, FloatLabel, InputGroup, Select, ReactiveFormsModule, InputGroupAddon, CreateEmailNotification],
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
export class CreateNotificationControl implements OnDestroy {
  // Notification providers
  public notificationProviders = input.required<NotificationProviderDTO[]>(); // Stores providers passed from parent
  private extraProviders = signal<NotificationProviderDTO[]>([]); // Stores extra providers created from dialog
  public currentProviders = computed<NotificationProviderDTO[]>(() => [...this.notificationProviders(),...this.extraProviders()]); // Stores all providers
  public notificationProvidersEnum = NotificationType;

  // Notifications
  public notifications = signal<CreateGuardNotificationDTO[]>([]); // The value of the notifications control
  public selectedNotifications = model<CreateGuardNotificationDTOWIndex[]>([]); // The items selected from indexedNotifications
  public indexedNotifications = computed<CreateGuardNotificationDTOWIndex[]>(() => // Copy of notifications but with an index key
    this.notifications().map((n, index) => ({ ...n, index: index }))
  );

  public notificationProviderSelection = new FormControl<NotificationProviderDTO | null>(null, [Validators.required]);
  
  // Control value accessor members
  private onChange: (value: CreateGuardNotificationDTO[]) => void = () => { };
  private onTouched: () => void = () => { };
  public disabled = signal<boolean>(false);

  // Dialog members
  private dialogService = inject(DialogService);
  private createProviderRef?: DynamicDialogRef<CreateNotificationProvider> | null;
  
  // Notifications to edit
  public notificationToEdit = signal<CreateGuardNotificationDTOWIndex | undefined>(undefined);
  public emailToEdit = computed<CreateEmailGuardNotificationDTOWIndex | undefined>(() => {
    const notification = this.notificationToEdit();
    return notification?.notificationType === NotificationType.Email ? notification as CreateEmailGuardNotificationDTOWIndex : undefined;
  });

  // Services
  private destroyRef = inject(DestroyRef);

  ngOnDestroy(): void {
    this.createProviderRef?.close();
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
  public editGuardNotification(): void {
    if(this.selectedNotifications().length !== 1){
      return;
    }
    const notificationToEdit = this.selectedNotifications()[0];
    this.notificationProviderSelection.patchValue(notificationToEdit.notificationProvider);
    this.notificationToEdit.set(notificationToEdit);
  }
  public removeGuardNotification(): void {
    if (this.selectedNotifications().length !== 1) {
      return;
    }
    const selectedIndices = this.selectedNotifications().map(n => n.index);
    this.notifications.update(notifications => {
      const filteredNotifications = notifications.filter((_, i) => !selectedIndices.includes(i));
      return [...filteredNotifications];
    })
    this.onChange(this.notifications());
    this.selectedNotifications.set([]);
  }
  public addNotificationProvider(): void { // Opens providers dialog to create a new one
    this.createProviderRef = this.dialogService.open(CreateNotificationProvider, {
      header: 'Create notification provider',
      maximizable: true,
      closable: true,
      resizable: true,
      draggable: true
    });
    this.createProviderRef?.onClose.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (newProvider: NotificationProviderDTO | undefined) => {
        if(newProvider){
          this.extraProviders.update(values => [...values, newProvider]);
        }
      }
    });
  }
  public notificationAdded(notification: CreateGuardNotificationDTO): void { // Called when child component emits a new notification to add
    this.notifications.update(notifications => [...notifications,notification]);
    this.onChange(this.notifications());
    this.notificationProviderSelection.reset();
  }
  public notificationEdited(notification: CreateGuardNotificationDTOWIndex): void { // Called when child component emits a notification that was edited
    this.notifications.update(notifications => {
      const editedNotifications = [...notifications];
      editedNotifications[notification.index] = notification;
      return editedNotifications;
    });
    this.onChange(this.notifications());
    this.notificationProviderSelection.reset();
    this.notificationToEdit.set(undefined);
    this.selectedNotifications.set([]);
  }
  public cancelNotification(): void { // Called when child component cancels add / edit
    this.notificationProviderSelection.reset();
    this.notificationToEdit.set(undefined);
  }
}
