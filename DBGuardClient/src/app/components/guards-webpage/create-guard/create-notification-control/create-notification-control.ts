import { Component, input, inputBinding, OnDestroy, OnInit, signal } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { enumToOptions } from '../../../../helper-functions/enum-helper';
import { NotificationType } from '../../../../enums/notification-type';
import { Card } from 'primeng/card';
import { Select } from 'primeng/select';
import { FloatLabel } from 'primeng/floatlabel';
import { Subject, takeUntil } from 'rxjs';
import { CreateGuardNotificationDTO, NotificationProviderDTO } from '../../../../interfaces/notification-dto';
import { isEmailProvider, isTextProvider } from '../../../../helper-functions/type-guards';
import { Tag } from 'primeng/tag';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { Button } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { InputText } from "primeng/inputtext";
import { Textarea } from 'primeng/textarea';
import { Listbox } from 'primeng/listbox';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-create-notification-control',
  imports: [Card, Select, ReactiveFormsModule, FloatLabel, Tag, InputGroup, InputGroupAddon, Button, TooltipModule, InputText, Textarea, Listbox],
  templateUrl: './create-notification-control.html',
  styleUrl: './create-notification-control.scss',
})
export class CreateNotificationControl implements ControlValueAccessor, OnInit, OnDestroy {
  public notificationProviders = input.required<NotificationProviderDTO[]>();

  private value = signal<CreateGuardNotificationDTO | null>(null);
  public disabled = signal<boolean>(false);
  private destroy = new Subject<void>();
  public isEmailProvider = isEmailProvider;
  public isTextProvider = isTextProvider;

  public notificationProvider = new FormControl<NotificationProviderDTO | null>(null, [Validators.required]);

  public emailNotificationFormGroup = new FormGroup({
    emailSubject: new FormControl<string | null>(null, [Validators.required]),
    emailBody: new FormControl<string | null>(null, [Validators.required]),
    toEmails: new FormControl<string[]>([], [Validators.required]),
    ccEmails: new FormControl<string[]>([]),
    bccEmails: new FormControl<string[]>([])
  });

  public emailAddressInput = new FormGroup({
    emailAddress: new FormControl<string | null>(null, [Validators.required, Validators.email]),
    emailType: new FormControl<'to' | 'cc' | 'bcc'>('to', [Validators.required])
  });
  private onChange: (value: CreateGuardNotificationDTO | null) => void = () => {};
  private onTouched:() => void = () => {};

  ngOnInit(): void {
    console.log(`Notification providers: ${JSON.stringify(this.notificationProviders)}`);
    this.notificationProvider.valueChanges.pipe(takeUntil(this.destroy)).subscribe(newVal => {
    });
    toSignal(this.emailNotificationFormGroup.get().valueChanges);
  }
  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
  writeValue(notification: CreateGuardNotificationDTO | null): void {
    this.value.set(notification);
  }
  registerOnChange(fn: (notification: CreateGuardNotificationDTO | null) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
  public onValueChanged(value: CreateGuardNotificationDTO | null): void {
    this.value.set(value);
    this.onChange(value);
  }

  public getEmailNotificationProviders(): void {
    return;
  }
  public getTextNotificationProviders(): void {
    return;
  }
  public createNotificationProvider(): void {
    return;
  }
  public addEmailAddress(): void {
    const emailAddress = this.emailAddressInput.get('emailAddress')?.value;
    const emailType = this.emailAddressInput.get('emailType')?.value
    if(!emailAddress || !emailType){
      return;
    }
    switch(emailType){
      case 'to':
        const toEmails = this.emailNotificationFormGroup.get('toEmails')?.value ?? [];
        if(toEmails.includes(emailAddress)){
          return;
        }
        toEmails.push(emailAddress);
        this.emailNotificationFormGroup.get('toEmails')?.patchValue(toEmails);
        break;
      case 'cc':
        break;
      case 'bcc':
        break;
    }
  }
}
