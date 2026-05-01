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

@Component({
  selector: 'app-create-email-notification',
  imports: [Listbox, FormsModule, ReactiveFormsModule, FloatLabel, InputGroup, InputGroupAddon, InputText, Textarea, Button, Select],
  templateUrl: './create-email-notification.html',
  styleUrl: './create-email-notification.scss',
})
export class CreateEmailNotification implements OnInit {
  // Emissions
  public notificationAdded = output<CreateEmailGuardNotificationDTO>(); // Emitted with new notification values
  public notificationEdited = output<CreateEmailGuardNotificationDTOWIndex>();
  public cancelNotification = output<void>(); // Emitted to cancel add or edit
  
  // Input
  public emailNotificationToEdit = input<CreateEmailGuardNotificationDTOWIndex>(); // Passed from parent if we're editing
  public notificationProvider = input.required<NotificationProviderDTO>();
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
    if(this.emailNotificationToEdit()){
      if(this.emailNotificationToEdit()?.emails){
        this.emails.set(this.emailNotificationToEdit()!.emails)
      }
      this.emailNotificationFormGroup.patchValue({
        emailSubject: this.emailNotificationToEdit()?.emailSubject,
        emailBody: this.emailNotificationToEdit()?.emailBody,
        emails: this.emailNotificationToEdit()?.emails
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

  public saveEmailNotification(): void {
    const values = this.emailNotificationFormGroup.value;
    if(this.emailNotificationToEdit()){
      const editedNotification: CreateEmailGuardNotificationDTOWIndex = {
        id: this.emailNotificationToEdit()?.id,
        guardId: this.emailNotificationToEdit()?.guardId,
        index: this.emailNotificationToEdit()!.index,
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
