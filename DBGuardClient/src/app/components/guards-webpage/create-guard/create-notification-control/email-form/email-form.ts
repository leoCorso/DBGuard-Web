import { Component, OnDestroy, OnInit, output, signal } from '@angular/core';
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { isValidEmail } from '../../../../../helper-functions/email-helper';
import { CreateEmailGuardNotificationDTO, EmailMessage } from '../../../../../interfaces/notification-dto';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { FloatLabel } from 'primeng/floatlabel';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { Listbox } from 'primeng/listbox';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-email-form',
  imports: [Card, Select, ReactiveFormsModule, FloatLabel, InputGroup, InputGroupAddon, Button, TooltipModule, InputText, Textarea, FormsModule, Listbox],
  templateUrl: './email-form.html',
  styleUrl: './email-form.scss',
})
export class EmailForm implements OnInit, OnDestroy {
  public emailNotificationFormGroup = new FormGroup({
    emailSubject: new FormControl<string | null>(null, [Validators.required]),
    emailBody: new FormControl<string | null>(null, [Validators.required]),
    emails: new FormControl<string[]>([], [Validators.required]),
  });
  public emails = signal<string[]>([]);

  public emailAddressInput = new FormGroup({
    emailAddress: new FormControl<string | null>(null, [Validators.required, Validators.email]),
    emailType: new FormControl<'to' | 'cc' | 'bcc'>('to', [Validators.required])
  });
  public selectedEmailAddresses = signal<string[]>([]);
  public emailMessage = output<EmailMessage>();
  private destroy = new Subject<void>();

  ngOnInit(): void {
  }
  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
  public addEmailAddress(): void {
    const emailAddress = this.emailAddressInput.get('emailAddress')?.value;
    const emailType = this.emailAddressInput.get('emailType')?.value;

    if (!emailAddress || !emailType) {
      return;
    }
    if (!isValidEmail(emailAddress)) {
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
  public removeEmailAddresses(): void {
    if (this.selectedEmailAddresses().length === 0) {
      return;
    }
    this.emails.update(emails => emails.filter(email => !this.selectedEmailAddresses().includes(email)));
    const formControl = this.emailNotificationFormGroup.get('emails');
    formControl?.patchValue(this.emails());
  }
  public addEmailNotification(): void {
    const emails = this.emailNotificationFormGroup.get('emails')!.value!;
    const emailSubject = this.emailNotificationFormGroup.get('emailSubject')!.value!;
    const emailBody = this.emailNotificationFormGroup.get('emailBody')!.value!;

    const newEmail: EmailMessage = {
      emails: emails,
      emailSubject: emailSubject,
      emailBody: emailBody,
    };
    this.emailMessage.emit(newEmail);
    this.emailNotificationFormGroup.reset();
  }
}
