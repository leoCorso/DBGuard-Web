import { Component, input, OnInit, output, signal } from '@angular/core';
import { CreateEmailGuardNotificationDTO, CreateEmailGuardNotificationDTOWIndex } from '../../../../interfaces/notification-dto';
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Listbox } from 'primeng/listbox';
import { FloatLabel } from 'primeng/floatlabel';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { Button } from 'primeng/button';
import { Select } from 'primeng/select';
import { NotificationType } from '../../../../enums/notification-type';
import { NotificationProviderDTO } from '../../../../interfaces/notification-provider-dto';
import { CreateNotification } from '../create-notification/create-notification';

@Component({
  selector: 'app-create-email-notification',
  imports: [Listbox, FormsModule, ReactiveFormsModule, FloatLabel, InputGroup, InputGroupAddon, InputText, Textarea, Button, Select],
  templateUrl: './create-email-notification.html',
  styleUrl: './create-email-notification.scss',
})
export class CreateEmailNotification extends CreateNotification<CreateEmailGuardNotificationDTO, CreateEmailGuardNotificationDTOWIndex> implements OnInit {
  
  // Input
  // Form controls
  public emailNotificationFormGroup = new FormGroup({
    emailSubject: new FormControl<string | null>(null, [Validators.required]),
    emailBody: new FormControl<string | null>(null, [Validators.required]),
    emails: new FormControl<string[]>([], [Validators.required]),
  });
  public emailAddressInput = new FormGroup({
    emailAddress: new FormControl<string | null>(null, [Validators.required, Validators.email]),
    emailType: new FormControl<'to' | 'cc' | 'bcc'>('to', [Validators.required])
  });
  // Emails
  public emails = signal<string[]>([]);
  public selectedEmailAddresses = signal<string[]>([]);

  ngOnInit(): void {
    if(this.notificationToEdit()){
      if(this.notificationToEdit()?.emails){
        this.emails.set(this.notificationToEdit()!.emails)
      }
      this.emailNotificationFormGroup.patchValue({
        emailSubject: this.notificationToEdit()?.emailSubject,
        emailBody: this.notificationToEdit()?.emailBody,
        emails: this.notificationToEdit()?.emails
      });
    }
  }
  public removeSelectedEmailAddresses(): void {
    if (this.selectedEmailAddresses().length === 0) {
      return;
    }
    this.emails.update(emails => emails.filter(email => !this.selectedEmailAddresses().includes(email)));
    this.emailNotificationFormGroup.get('emails')?.patchValue(this.emails());
  }
  public addEmailAddress(): void {
    const emailAddress = this.emailAddressInput.get('emailAddress')?.value;
    const emailType = this.emailAddressInput.get('emailType')?.value;

    if (!emailAddress || !emailType) {
      return;
    }
    const emailString = emailType + ':' + emailAddress;
    if (this.emails().includes(emailString)) {
      return;
    }
    this.emails.update(emails => [...emails,emailString]);
    const formControl = this.emailNotificationFormGroup.get('emails');
    formControl?.patchValue(this.emails());
    this.emailAddressInput.get('emailAddress')?.reset();  // Reset email input
  }

  public saveNotification(): void {
    const values = this.emailNotificationFormGroup.value;
    if(this.notificationToEdit()){
      const editedNotification: CreateEmailGuardNotificationDTOWIndex = {
        id: this.notificationToEdit()?.id,
        guardId: this.notificationToEdit()?.guardId,
        index: this.notificationToEdit()!.index,
        emailSubject: values.emailSubject!,
        emailBody: values.emailBody!,
        emails: values.emails!,
        notificationType: NotificationType.Email,
        notificationProvider: this.notificationProvider()
      }
      this.notificationEdited.emit(editedNotification);
    }
    else {
      const newNotification: CreateEmailGuardNotificationDTO = {
        emailSubject: values.emailSubject!,
        emailBody: values.emailBody!,
        emails: values.emails!,
        notificationType: NotificationType.Email,
        notificationProvider: this.notificationProvider()
      }
      this.notificationAdded.emit(newNotification);
    }
  }
}
